import Agent from "./Agent";
import Network from "./Network";
import { readFileSync } from "fs";
import OpenAI from "openai";

async function main(
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
    "You are a polite, thoughtful and intelligent panel discussion member. " +
    "You are an subject matter expert on the topics discussed." +
    "Provide thoughtful, insightful and respectful responses to the other panel members. Keep it concise and to the point." +
    "Share new ideas that arise during the discussion to add depth and breadth to the conversation." +
    "If given a specific problem, focus on solving the problem in novel ways.";

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_API_URL || "https://api.openai.com",
  });

  const agents = [];
  for (let i = 0; i < options.agents; i++) {
    agents.push(
      new Agent(
        `Agent${i}`,
        options.models[i % options.models.length],
        system_prompt,
        20, // historyLimit
        options.researchBreadth,
        options.researchDepth,
        options.researchModel,
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
    false, // disable enableResearch, since it's now handled by tool calling.
  );
  console.log("Final Report:\n", finalReport);
}

function printHelp() {
  console.log(
    "Usage: node index.js [OPTIONS]\n" +
      "Options:\n" +
      "  --agents AGENTS    The number of agents to use in the conversations\n" +
      "  --groups GROUPS    The number of groups to divide the agents into\n" +
      "  --rounds ROUNDS    The number of rounds to run the conversation (Default: 3)\n" +
      "  --steps STEPS      The number of steps to run the conversation in each round\n" +
      "                     before sharing insights (Default: 5)\n" +
      "  --models MODELS    The models to use for the agents, separated by commas\n" +
      "                     (default OPENAI_MODELS from env)\n" +
      "  -t, --text TEXT    The text to be used as context for the conversation\n" +
      "  -f, --file FILE    The path to a file containing the text to be used as context\n" +
      "  --enableResearch   Enable research during the conversation\n" +
      "  --researchBreadth  Set the breadth of the research (Default: 2)\n" +
      "  --researchDepth    Set the depth of the research (Default: 2)\n" +
      "  --researchModel    The model to use for research (defaults to first model in --models)\n" +
      "  -h, --help         Display this help information",
  );
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    text: "",
    file: "",
    agents: 4,
    groups: 2,
    rounds: 3,
    steps: 5,
    models: ["gpt-4o-mini"],
    enableResearch: false,
    researchBreadth: 2,
    researchDepth: 2,
    researchModel: "",
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--agents":
        options.agents = parseInt(args[i + 1]);
        break;
      case "--groups":
        options.groups = parseInt(args[i + 1]);
        break;
      case "--rounds":
        options.rounds = parseInt(args[i + 1]);
        break;
      case "--steps":
        options.steps = parseInt(args[i + 1]);
        break;
      case "--models":
        options.models = args[i + 1].split(",");
        break;
      case "-t":
      case "--text":
        options.text = args[i + 1];
        break;
      case "-f":
      case "--file":
        options.file = args[i + 1];
        break;
      case "--enableResearch":
        options.enableResearch = true;
        console.log("Research enabled!");
        break;
      case "--researchBreadth":
        options.researchBreadth = parseInt(args[i + 1]);
        break;
      case "--researchDepth":
        options.researchDepth = parseInt(args[i + 1]);
        break;
      case "--researchModel":
        options.researchModel = args[i + 1];
        break;
      case "-h":
      case "--help":
        printHelp();
        process.exit(0);
        break;
    }
  }

  if (options.agents < 2) {
    console.error("Number of agents must be at least 2");
    process.exit(1);
  }

  if (options.groups < 1) {
    console.error("Number of groups must be at least 1");
    process.exit(1);
  }

  if (options.agents % options.groups !== 0) {
    console.error("Number of agents must be divisible by number of groups");
    process.exit(1);
  }

  if (options.agents / options.groups < 2) {
    console.error("Number of agents per group must be at least 2");
    process.exit(1);
  }

  if (options.rounds < 1) {
    console.error("Number of rounds must be at least 1");
    process.exit(1);
  }

  if (options.steps < 2) {
    console.error("Number of steps must be at least 2");
    process.exit(1);
  }

  if (!options.text && !options.file) {
    console.error("Must provide either text or file for context");
    process.exit(1);
  }

  return options;
}

function getContext(options: { text: string; file: string }) {
  if (options.file) {
    try {
      return (
        readFileSync(options.file, "utf-8") +
        (options.text ? `\n\n${options.text}` : "")
      );
    } catch (error) {
      console.error("Error reading file:", error);
      return "";
    }
  } else if (options.text) {
    return options.text;
  } else {
    throw new Error("No context provided");
  }
}

function runMain() {
  const options = parseArgs();
  const context = getContext(options);

  main(context, options);
}

runMain();
