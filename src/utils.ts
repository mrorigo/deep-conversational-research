import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat";

async function callOpenAI(
  openai: OpenAI,
  model: string,
  messages: ChatCompletionMessageParam[],
  options?: any,
  retries: number = 3,
): Promise<any> {
  const req = {
    model: model,
    messages: messages,
    ...options,
  };
  try {
    const completion = await openai.chat.completions.create(req);
    return completion.choices[0].message;
  } catch (error: any) {
    console.error("Error calling LLM:", error);
    if (error.status === 429) {
      if (retries > 0) {
        // Implement exponential backoff
        const delay = Math.pow(2, 3 - retries) * 1000;
        console.log(`Retrying in ${delay}ms... (${retries} retries remaining)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return callOpenAI(openai, model, messages, options, retries - 1); // Retry
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

export { callOpenAI };
