import Agent from "./Agent.js";
import Network from "./Network.js";
import OpenAI from "openai";
import { Logger } from "./logger.js";
import { LLMConfig } from "./utils.js";
import { describePersonas, generatePersonas, Persona } from "./Personas.js";

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
  logger: Logger,
) {
  const system_prompt =
    "You are a polite, thoughtful and intelligent subject matter expert participating in a panel discussion.\n" +
    "The panel is divided into groups, and you are in a group with other panel members.\n" +
    "After a number of turns, your group insights will be shared with other groups, and theirs with your group.\n" +
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

  logger.log("NewResearchConversation", {
    context,
    options,
  });

  const personasLlmConfig = {
    model: options.models[0],
    openai,
    options: {
      temperature: 0.5,
    },
  } as LLMConfig;

  const personas = await generatePersonas(
    personasLlmConfig,
    context,
    options.groups,
    options.agents,
  );

  console.log("Personas", personas);

  const groupDescriptions = [];
  for (const group of personas) {
    const description = await describePersonas(
      personasLlmConfig,
      context,
      group,
    );
    groupDescriptions.push(description);
  }

  console.log("GroupDescriptions", groupDescriptions);

  // const agents: Agent[] = [];
  //

  const agents_per_group = Math.floor(options.agents / options.groups);
  const groupedAgents: Agent[][] = [];
  for (let i = 0; i < options.groups; i++) {
    const group = [];
    for (let j = 0; j < agents_per_group; j++) {
      const agents_per_group = Math.floor(options.agents / options.groups);
      const model = options.models[i % options.models.length];
      const llmConfig = {
        model,
        openai,
        options: {
          temperature: 0.5,
        },
      } as LLMConfig;

      const personaPrompt = personas[i][j].about_you;
      const agentPrompt = `${personaPrompt}\n${system_prompt}\n${groupDescriptions[i]}`;
      console.log("AgentPrompt", agentPrompt);

      const agent = new Agent(
        personas[i][j].name,
        llmConfig,
        agentPrompt,
        20, // historyLimit
        options.researchBreadth,
        options.researchDepth,
        logger,
      );
      group.push(agent);
    }
    groupedAgents.push(group);
  }
  console.log(groupedAgents);

  const summaryModel = options.models[0];
  const summaryllmConfig = {
    model: summaryModel,
    openai,
    options: {
      temperature: 0.3,
    },
  } as LLMConfig;

  // Create a network, use the first model as the summary model
  const network = new Network(
    groupedAgents,
    groupDescriptions,
    summaryllmConfig,
    logger,
  );

  // Start conversations
  const finalReport = await network.startConversations(
    context,
    options.rounds,
    options.steps,
    options.enableResearch,
  );
  logger.log("FinalReports", {
    report: finalReport[0],
    revisedReport: finalReport[1],
  });
  console.log("Final Reports\n", finalReport[0], finalReport[1]);
}
