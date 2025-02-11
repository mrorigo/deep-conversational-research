import Agent from "./Agent.js";
import Network from "./Network.js";
import OpenAI from "openai";
import getLogger from "./logger.js";

export async function main(
  context: string,
  options: {
    rounds: number;
    steps: number;
    models: string[];
    agents: number;
    groups: number;
    enableResearch: boolean;
    researchBreadth: number;
    researchDepth: number;
    researchModel?: string;
  },
) {
  const system_prompt =
    "You are a polite, thoughtful and intelligent subject matter expert researcher taking part in a panel discussion. " +
    "The panel is divided into groups, and you are in a group with other panel members. " +
    "After a number of turns, your group insights will be shared with other groups, and theirs with your group." +
    "Provide thoughtful, insightful and respectful input to the discussion. Keep it concise and to the point." +
    "Share new ideas that arise during the discussion to add depth and breadth to the conversation." +
    "If given a specific problem, focus on solving the problem in novel ways.";

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in the environment.");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_API_URL || "https://api.openai.com",
  });

  getLogger().log("NewResearchConversation", {
    context,
    options,
  });

  const agents = [];
  for (let i = 0; i < options.agents; i++) {
    agents.push(
      new Agent(
        `Agent${i}`,
        options.models[i % options.models.length],
        options.researchModel || options.models[0],
        system_prompt,
        20, // historyLimit
        options.researchBreadth,
        options.researchDepth,
        openai,
      ),
    );
  }

  // Create a network, use the first model as the summary model
  const network = new Network(agents, options.models[0], openai);

  // Create subgroups
  network.createSubgroups(options.groups);

  // Start conversations
  const finalReport = await network.startConversations(
    context,
    options.rounds,
    options.steps,
    options.enableResearch,
  );
  getLogger().log("FinalReports", {
    report: finalReport[0],
    revisedReport: finalReport[1],
  });
  console.log("Final Reports\n", finalReport[0], finalReport[1]);
}
