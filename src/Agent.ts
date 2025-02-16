import { callOpenAI, getSystemRole, LLMConfig } from "./utils.js";
import { ChatCompletionMessageParam } from "openai/resources/index.js";

class Agent {
  constructor(
    public id: string,
    private llmConfig: LLMConfig,
    private system_prompt: string,
    public historyLimit: number = 20,
    public breadth: number = 3,
    public depth: number = 2,
  ) {}

  public async generateResponse(history: string[]): Promise<string> {
    const messages = [
      {
        role: getSystemRole(this.llmConfig.model),
        content: this.system_prompt,
      },
      ...history.map((msg) => ({ role: "user", content: msg })),
    ];

    try {
      const message = await callOpenAI(
        this.llmConfig,
        messages as ChatCompletionMessageParam[],
      );
      return message.content;
    } catch (error) {
      console.error("Error generating response:", error);
      return "Error generating response.";
    }
  }
}

export default Agent;
