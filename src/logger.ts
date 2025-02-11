import { EventEmitter } from "events";
import pg from "pg";

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

export class Logger extends EventEmitter {
  private pool: pg.Pool; // Add a connection pool
  private isClosing: boolean = false;

  constructor(private logName?: string) {
    super();

    // Initialize the connection pool
    this.pool = new pg.Pool({
      user: process.env.POSTGRES_USER || "postgres",
      host: process.env.POSTGRES_HOST || "localhost",
      database: process.env.POSTGRES_DB || "deep_conversational_research",
      password: process.env.POSTGRES_PASSWORD || "postgres",
      port: parseInt(process.env.POSTGRES_PORT || "5432"),
    });

    this.createLogTable();
  }

  private async createLogTable(): Promise<void> {
    try {
      const client = await this.pool.connect();
      await client.query(`
        CREATE TABLE IF NOT EXISTS logs (
          id SERIAL PRIMARY KEY,
          timestamp TIMESTAMPTZ NOT NULL,
          conversationId VARCHAR(255),
          event VARCHAR(255) NOT NULL,
          details JSONB
        );
      `);
      client.release();
      console.log("Log table created or already exists.");
    } catch (err) {
      console.error("Error creating log table:", err);
    }
  }

  public async log(
    event: EventType,
    details: Record<string, any> = {},
    conversationId?: string,
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      ...details,
      conversationId,
    };

    try {
      const client = await this.pool.connect();
      await client.query(
        "INSERT INTO logs(timestamp, conversationId, event, details) VALUES($1, $2, $3, $4)",
        [timestamp, conversationId, event, logEntry],
      );
      client.release();
      console.log(JSON.stringify(logEntry));
    } catch (err) {
      console.error("Error inserting log entry:", err);
    }
  }

  public async getLogs(): Promise<any[]> {
    try {
      const client = await this.pool.connect();
      console.log("Retrieving logs for conversation:", this.logName);
      const result = await client.query(
        "SELECT * FROM logs WHERE conversationId = $1 ORDER BY timestamp",
        [this.logName],
      );
      client.release();
      console.log("Logs retrieved:", result.rows.length);
      return result.rows;
    } catch (err) {
      console.error("Error retrieving logs:", err);
      return [];
    }
  }

  public async getDistinctConversationIds(): Promise<any[]> {
    try {
      const client = await this.pool.connect();
      const result = await client.query(
        "SELECT DISTINCT conversationId FROM logs",
      );
      client.release();
      console.log("Distinct conversation IDs:", result.rows);
      return result.rows;
    } catch (err) {
      console.error("Error retrieving distinct conversation IDs:", err);
      return [];
    }
  }

  public async closePool(): Promise<void> {
    if (!this.isClosing) {
      this.isClosing = true;
      console.log("Closing the database connection pool...");
      await this.pool.end();
      console.log("Database connection pool closed.");
    } else {
      console.log("closePool() called, but pool is already closing or closed.");
    }
  }
}

let loggers: Record<string, Logger> = {};

const getLogger = (logFileName: string) => {
  if (!loggers.hasOwnProperty(logFileName)) {
    const logger = new Logger(logFileName);
    loggers[logFileName] = logger;
  }
  return loggers[logFileName];
};

export default getLogger;
