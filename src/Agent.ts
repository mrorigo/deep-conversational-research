import OpenAI from "openai";
import * as dotenv from "dotenv";
import { ChatCompletionMessageParam } from "openai/resources/chat";
import { deepResearch } from "./research/deepResearch";
import { callOpenAI } from "./utils";

dotenv.config();

const defaultSystemPrompt = `You are a polite, thoughtful and intelligent research collaborator. You are an expert-level subject matter expert on the topics discussed. Provide thoughtful, insightful and respectful responses to the other panel members. Keep it concise and to the point. Share new ideas that arise during the discussion to add depth and breadth to the conversation. If given a specific problem, focus on solving the problem in novel ways. You can also perform research to gather more information.`;

type ToolDefinition = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: {
        query: {
          type: "string";
          description: string;
        };
      };
      required: ["query"];
    };
  };
};

interface AgentContext {
  model: string;
  callOpenAI: (
    openai: OpenAI,
    model: string,
    messages: any,
    options?: any,
    retries?: number,
  ) => Promise<any>;
}

class Agent {
  private conversationHistory: ChatCompletionMessageParam[];
  public breadth: number;
  public depth: number;
  private researchModel: string;

  constructor(
    public id: string,
    private model: string = "gpt-4o-mini",
    private system_prompt: string = defaultSystemPrompt,
    public historyLimit: number = 20,
    breadth: number = 3,
    depth: number = 2,
    researchModel?: string,
    private openai?: OpenAI,
  ) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in the environment.");
    }

    this.openai =
      openai ||
      new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_API_URL || "https://api.openai.com",
      });
    this.conversationHistory = [];
    this.historyLimit = historyLimit;
    this.model = model;
    this.id = id;
    this.breadth = breadth;
    this.depth = depth;
    this.researchModel = researchModel || model;
  }

  private getResearchToolDefinition(): ToolDefinition {
    return {
      type: "function",
      function: {
        name: "deepResearch",
        description:
          "Performs deep research on a given query and returns a list of learnings.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The query to research.",
            },
          },
          required: ["query"],
        },
      },
    };
  }

  public async generateResponse(
    prompt: string,
    forceResearch: boolean = false,
  ): Promise<string> {
    this.conversationHistory.push({ role: "user", content: prompt });

    const tools: ToolDefinition[] = [this.getResearchToolDefinition()];

    let tool_choice: any = "auto";
    if (forceResearch) {
      tool_choice = { type: "function", function: { name: "deepResearch" } };
    }

    try {
      const message = await callOpenAI(
        this.openai as OpenAI,
        this.model,
        [
          { role: "system", content: this.system_prompt },
          ...this.conversationHistory,
        ],
        {
          tools: tools,
          tool_choice: tool_choice,
          // response_format: { type: "json_object" },
        },
      );

      const parsedResponse = message?.content || "No response";
      const toolCalls = message?.tool_calls;

      if (toolCalls) {
        for (const toolCall of toolCalls) {
          if (toolCall.function.name === "deepResearch") {
            const query = JSON.parse(toolCall.function.arguments).query;
            console.log(`${this.id}: Performing research on query: ${query}`);
            const researchResult = await this.performResearch(query);
            const learnings = researchResult.learnings.join("\n");

            this.conversationHistory.push({
              role: "user",
              content: `Researched topic: "${query}", and found the following learnings:\n${learnings}`,
            });
          } else {
            console.error("Unknown tool call:", toolCall);
          }
        }
      } else {
        this.conversationHistory.push({
          role: "assistant",
          content: parsedResponse,
        });
      }

      // Keep only the last N messages
      if (this.conversationHistory.length > this.historyLimit * 2) {
        this.conversationHistory = this.conversationHistory.slice(
          this.conversationHistory.length - this.historyLimit * 2,
        );
      }

      return parsedResponse;
    } catch (error) {
      console.error("Error generating response:", error);
      return "Error generating response.";
    }
  }

  public getConversationHistory(): ChatCompletionMessageParam[] {
    return this.conversationHistory;
  }

  public clearConversationHistory(): void {
    this.conversationHistory = [];
  }

  public async performResearch(
    query: string,
  ): Promise<{ learnings: string[]; visitedUrls: string[] }> {
    return deepResearch({
      query: query,
      breadth: this.breadth,
      depth: this.depth,
      agentContext: {
        model: this.researchModel,
        callOpenAI: callOpenAI,
        openai: this.openai as OpenAI,
      },
    });
  }
}

export default Agent;
