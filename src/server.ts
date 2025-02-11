import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import * as http from "http";
import * as url from "url";
import { main } from "./index.js";
import getLogger, { Logger } from "./logger.js";
import * as fs from "fs";
import path from "path";

const app = express();
const port = process.env.PORT || 3210;

// Serve static files from the dist/frontend directory
const __dirname = path.resolve();

// Add a catch-all route to serve index.html and ensure the CSP header is applied
app.get("/", (req, res) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://code.jquery.com https://cdn.jsdelivr.net https://stackpath.bootstrapcdn.com; script-src-elem 'self' https://code.jquery.com https://cdn.jsdelivr.net https://stackpath.bootstrapcdn.com 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://stackpath.bootstrapcdn.com https://fonts.googleapis.com/; img-src 'self' data:; font-src 'self' https://stackpath.bootstrapcdn.com https://fonts.googleapis.com/",
  );

  res.sendFile(path.join(__dirname, "frontend", "index.html"), (err) => {
    if (err) {
      res.status(500).send(err);
    }
  });
});
app.use(express.static(path.join(__dirname, "frontend")));

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// Store active conversations with their IDs and WebSocket connections
const activeConversations: Map<string, WebSocket> = new Map();

async function replayLogFromFile(ws: WebSocket, logger: Logger) {
  try {
    const logs = await logger.getLogs();

    if (!logs || logs.length === 0) {
      console.warn(`No logs found for conversation`);
      return;
    }

    // Replay logs to the WebSocket client
    for (const logEntry of logs) {
      ws.send(JSON.stringify({ type: "log", payload: logEntry.details }));
      await new Promise((resolve) => setTimeout(resolve, 10)); // Introduce a 10ms delay
    }

    console.log(`Log replay of ${logs.length} entries complete.`);
  } catch (error) {
    console.error("Error replaying log:", error);
    ws.send(JSON.stringify({ type: "error", message: "Error replaying logs" }));
  }
}

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("WebSocket connection established");

  let conversationId: string | null = null; // Store the conversation ID for this connection

  let logFd: fs.promises.FileHandle | null = null;

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());

      console.log("Received message:", data);

      if (data.type === "start") {
        const {
          topic,
          num_groups,
          num_agents,
          enableResearch,
          researchDepth,
          researchBreadth,
          models,
          rounds,
          steps,
          conversationId: receivedConversationId, // Extract conversationId from message
        } = data.payload;

        console.log("Received start message:", data.payload);

        // Basic validation (more robust validation might be needed)
        if (
          !topic ||
          !num_groups ||
          !num_agents ||
          !models ||
          !rounds ||
          !steps ||
          !receivedConversationId
        ) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Missing parameters in start message",
            }),
          );
          return;
        }

        conversationId = receivedConversationId; // Assign the received conversationId

        const options = {
          agents: num_agents,
          groups: num_groups,
          rounds: rounds,
          steps: steps,
          models: models.map((x: string) => x.trim()),
          text: topic,
          file: "",
          enableResearch: enableResearch,
          researchBreadth: researchBreadth,
          researchDepth: researchDepth,
          researchModel: models[0], // Default to first model
        };

        const logger = getLogger(receivedConversationId); // Get the logger instance here

        logger.on("log", (log) => {
          const message = JSON.stringify({ type: "log", payload: log });
          try {
            ws.send(message);
          } catch (e) {
            console.error("Error sending log message:", e);
          }
        });

        // Store the active conversation
        activeConversations.set(conversationId as string, ws);

        // Call the main function with the extracted parameters
        main(topic, options, logger)
          .then(() => {
            logger.emit(
              "log",
              {
                type: "status",
                message: "Conversation completed",
              },
              conversationId,
            );
          })
          .catch((error: any) => {
            console.error("Error during conversation:", error);
            logger.emit(
              "log",
              {
                type: "error",
                message: `Conversation failed: ${error.message}`,
              },
              conversationId,
            );
          })
          .finally(async () => {
            activeConversations.delete(conversationId!);
          });
      } else if (data.type === "replay") {
        const replayConversationId = data.payload.conversationId;
        const logger = getLogger(replayConversationId);
        if (!replayConversationId) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Missing conversationId in replay message",
            }),
          );
          return;
        }
        console.log("Replaying logs for conversation:", replayConversationId);
        replayLogFromFile(ws, logger);
      } else {
        console.log(
          "Unknown message type " + data.type + " received: " + data.payload,
        );
      }
    } catch (error: any) {
      console.error("Error processing message:", error);
      console.log(`Invalid message format: ${error.message}`, conversationId);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
    // remove all listeners
    if (conversationId) {
      activeConversations.delete(conversationId);
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    if (conversationId) {
      activeConversations.delete(conversationId);
    }
  });
});

server.on("upgrade", (request: any, socket, head) => {
  const pathname = url.parse(request.url).pathname;

  if (pathname === "/websocket") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Endpoint to list available topics and their conversation IDs
app.get("/api/topics", async (req, res) => {
  console.log("Listing available topics...");
  try {
    const logger = getLogger("topics");
    const conversationIds = await logger.getDistinctConversationIds();

    const topics = conversationIds
      .map((log) => {
        const conversationId = log.conversationid;
        if (conversationId) {
          const topic = Buffer.from(
            conversationId.split("-")[0],
            "base64",
          ).toString("ascii");
          return { id: conversationId, topic: topic };
        }
        return null;
      })
      .filter((topic) => topic !== null);
    res.json(topics);
  } catch (error) {
    console.error("Error reading log directory:", error);
    res.status(500).json({ error: "Failed to read log directory" });
  }
});

// Handle shutdown signals
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

async function shutdown() {
  console.log("Shutting down server...");

  // Close WebSocket connections
  wss.close(() => {
    console.log("WebSocket server closed");

    const logger = getLogger("shutdown");
    // Close the database connection pool
    logger.closePool().then(() => {
      console.log("Database connection pool closed");
      // Close the server
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    });
  });

  // Forcefully close the server after a timeout
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down",
    );
    process.exit(1);
  }, 3000);
}

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
