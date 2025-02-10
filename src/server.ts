import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import * as http from "http";
import * as url from "url";
import { main } from "./index";
import getLogger from "./logger";
import { open, readFile } from "fs/promises";
import * as fs from "fs";

const app = express();
const port = process.env.PORT || 3210;

// Serve static files from the public directory
app.use(express.static("public"));

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

    let startReplay = false;
    for (let i = logLines.length - 1; i >= 0; i--) {
      const line = logLines[i];
      try {
        const logEntry = JSON.parse(line);
        if (logEntry.event === "ConversationStarted") {
          startReplay = true;
        }

        if (startReplay) {
          ws.send(JSON.stringify({ type: "log", payload: logEntry }));
        }
      } catch (e) {
        console.warn(`Couldn't parse log line ${i + 1}:`, line, e);
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
          models: models,
          text: topic,
          file: "",
          enableResearch: enableResearch,
          researchBreadth: researchBreadth,
          researchDepth: researchDepth,
          researchModel: models[0], // Default to first model
        };

        // Set up logging to the websocket
        logFd = await open("conversation.log", "a");
        logger.on("log", (log) => {
          const message = JSON.stringify({ type: "log", payload: log });
          ws.send(message);
          if (logFd) {
            logFd.write(JSON.stringify(log) + "\n");
          }
        });

        // Call the main function with the extracted parameters
        main(topic, options)
          .then((finalResults) => {
            ws.send(
              JSON.stringify({
                type: "log",
                payload: {
                  event: "ConversationComplete",
                  data: finalResults,
                },
              }),
            );
          })
          .catch((error: any) => {
            console.error("Error during conversation:", error);
            ws.send(
              JSON.stringify({
                type: "error",
                message: `Conversation failed: ${error.message}`,
              }),
            );
          })
          .finally(async () => {
            if (logFd) {
              await logFd.close();
            }
          });
      } else {
        ws.send(
          JSON.stringify({ type: "error", message: "Unknown message type" }),
        );
      }
    } catch (error: any) {
      console.error("Error processing message:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: `Invalid message format: ${error.message}`,
        }),
      );
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
