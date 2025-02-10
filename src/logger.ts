import fs from "fs";
import path from "path";

export type EventType =
  | "ConversationStarted"
  | "MessageSent"
  | "InsightsShared"
  | "ResearchEvent"
  | "RoundStarted"
  | "StepStarted"
  | "RoundEnded"
  | "FinalReports";

class Logger {
  private logFile: string;

  constructor(logFileName: string = "conversation.log") {
    this.logFile = path.join(__dirname, logFileName);
  }

  public log(event: EventType, details: Record<string, any> = {}): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      ...details,
    };
    fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + "\n");
  }
}

let logger: Logger | null = null;

const getLogger = (logFileName?: string) => {
  if (!logger) {
    logger = new Logger(logFileName);
  }
  return logger;
};

export default getLogger;
