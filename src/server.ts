import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import * as http from "http";
import * as url from "url";
import { main } from "./index.js";
import getLogger from "./logger.js";
import { open, readFile } from "fs/promises";
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
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://code.jquery.com https://cdn.jsdelivr.net https://stackpath.bootstrapcdn.com; script-src-elem 'self' https://code.jquery.com https://cdn.jsdelivr.net https://stackpath.bootstrapcdn.com 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://stackpath.bootstrapcdn.com; img-src 'self' data:; font-src 'self' https://stackpath.bootstrapcdn.com",
  );

  res.sendFile(path.join(__dirname, "dist/frontend", "index.html"), (err) => {
    if (err) {
      res.status(500).send(err);
    }
  });
});
app.use(express.static(path.join(__dirname, "dist/frontend")));

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

async function replayLogFromFile(ws: WebSocket) {
  try {
    const logFilePath = "conversation.log";
    if (!fs.existsSync(logFilePath)) {
      console.log(`Log file ${logFilePath} not found.  Skipping replay.`);
      return; // Skip replay if the log file doesn't exist.
    }
    const logData = await readFile(logFilePath, "utf-8");
    const logLines = logData.trim().split("\n");

    let lastNewResearchConversationIndex = -1;
    for (let i = logLines.length - 1; i >= 0; i--) {
      try {
        const logEntry = JSON.parse(logLines[i]);
        if (logEntry.event === "NewResearchConversation") {
          lastNewResearchConversationIndex = i;
          break; // Stop at the last occurrence
        }
      } catch (e) {
        console.warn(`Couldn't parse log line ${i + 1}:`, logLines[i], e);
      }
    }

    if (lastNewResearchConversationIndex !== -1) {
      for (let i = lastNewResearchConversationIndex; i < logLines.length; i++) {
        const line = logLines[i];
        try {
          const logEntry = JSON.parse(line);
          ws.send(JSON.stringify({ type: "log", payload: logEntry }));
        } catch (e) {
          console.warn(`Couldn't parse log line ${i + 1}:`, line, e);
        }
      }
    }

    console.log("Log replay complete.");
  } catch (error) {
    console.error("Error replaying log:", error);
  }
}

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("WebSocket connection established");

  // Replay log events
  replayLogFromFile(ws);

  const logger = getLogger();
  let logFd: fs.promises.FileHandle | null = null;

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());

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
        } = data.payload;

        console.log("Received start message:", data.payload);

        // Basic validation (more robust validation might be needed)
        if (
          !topic ||
          !num_groups ||
          !num_agents ||
          !models ||
          !rounds ||
          !steps
        ) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Missing parameters in start message",
            }),
          );
          return;
        }

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

        // Set up logging to the websocket and log file
        logFd = await open("conversation.log", "a");
        logger.on("log", (log) => {
          const message = JSON.stringify({ type: "log", payload: log });
          try {
            ws.send(message);
          } catch (e) {
            console.error("Error sending log message:", e);
          }
          if (logFd) {
            logFd.write(JSON.stringify(log) + "\n");
          }
        });

        // Call the main function with the extracted parameters
        main(topic, options)
          .then(() => {
            logger.emit("log", {
              type: "status",
              message: "Conversation completed",
            });
          })
          .catch((error: any) => {
            console.error("Error during conversation:", error);
            logger.emit("log", {
              type: "error",
              message: `Conversation failed: ${error.message}`,
            });
          })
          .finally(async () => {
            if (logFd) {
              await logFd.close();
            }
          });
      } else {
        logger.emit("log", {
          type: "error",
          message: "Unknown message type",
        });
      }
    } catch (error: any) {
      console.error("Error processing message:", error);
      logger.emit("log", {
        type: "error",
        message: `Invalid message format: ${error.message}`,
      });
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
    // remove all listeners
    logger.removeAllListeners("log");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
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

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
