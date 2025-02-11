import { EventEmitter } from "events";

export type EventType =
  | "NewResearchConversation"
  | "ConversationStarted"
  | "MessageSent"
  | "InsightsShared"
  | "ResearchEvent"
  | "RoundStarted"
  | "StepStarted"
  | "RoundEnded"
  | "AllSharedInsights"
  | "FinalReports";

class Logger extends EventEmitter {
  constructor(private logFileName?: string) {
    // logFileName is now optional
    super();
  }

  public log(event: EventType, details: Record<string, any> = {}): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      ...details,
    };
    this.emit("log", logEntry); // Emit the 'log' event
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
