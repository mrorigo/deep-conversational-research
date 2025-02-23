import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat";
import { limitFunction } from "p-limit";

// Handle system prompt based on the model (o-models don't accept system role)
const getSystemRole = (model: string): "user" | "system" => {
  return model.startsWith("o") ? "user" : "system";
};

export type LLMConfig = {
  openai: OpenAI;
  model: string;
  options?: {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
  };
};

const callOpenAI = limitFunction(
  async (
    llmConfig: LLMConfig,
    messages: ChatCompletionMessageParam[],
    options?: any,
    retries: number = 5,
  ): Promise<any> => {
    return await limitedLLMCall(llmConfig, messages, options, retries);
  },
  { concurrency: 2 },
);

async function limitedLLMCall(
  llmConfig: LLMConfig,
  messages: ChatCompletionMessageParam[],
  options?: any,
  retries: number = 5,
): Promise<any> {
  const req = {
    model: llmConfig.model,
    messages: messages,
    ...options,
    ...llmConfig.options,
  };
  try {
    const completion = await llmConfig.openai.chat.completions.create(req);
    return completion.choices[0].message;
  } catch (error: any) {
    console.error("Error calling LLM:", error);
    if (error.status === 429) {
      if (retries > 0) {
        // Implement exponential backoff
        const delay = Math.pow(2, 3 - retries) * 1000;
        console.log(`Retrying in ${delay}ms... (${retries} retries remaining)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return limitedLLMCall(llmConfig, messages, options, retries - 1); // Retry
      } else {
        console.error("Max retries reached.  Failed to call LLM.");
        throw error; // Re-throw the error after exhausting retries
      }
    } else {
      console.error("Error calling LLM:", error, req);
      throw error;
    }
  }
}

export { callOpenAI, getSystemRole };
