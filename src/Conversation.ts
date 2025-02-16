import { deepResearch } from "./research/deepResearch.js";
import Agent from "./Agent.js";
import { Logger } from "./logger.js"; // Import the logger
import { LLMConfig } from "./utils.js";

class Conversation {
  private conversationHistory: string[] = [];

  constructor(
    private group: number,
    private agents: Agent[],
    private topic: string,
    private logger: Logger,
    private researchLLMConfig: LLMConfig,
    private researchDepth: number = 1,
    private researchBreadth: number = 2,
  ) {
    //this.enableResearch = researchQuery.length > 0;
    this.logger.log("ConversationStarted", {
      group,
      topic,
      agents: agents.map((agent) => agent.id),
    });
  }

  public async startRound(
    roundNumber: number,
    researchQuery: string,
    maxSteps: number = 5,
  ): Promise<void> {
    this.logger.log("RoundStarted", {
      group: this.group,
      roundNumber,
      topic: this.topic,
    });

    if (researchQuery) {
      const researchResult = await this.performResearch(researchQuery);
      const learnings = researchResult.learnings.join("\n");

      this.conversationHistory.push(
        `Research was made on "${researchQuery}", and the following learnings were found:\n${learnings}`,
      );
    }

    // let currentPrompt = `Round ${roundNumber}: We're discussing: ${this.topic}.`;

    let currentAgentIndex = 0;

    for (let i = 0; i < maxSteps; i++) {
      const currentAgent = this.agents[currentAgentIndex];

      // Force research on the first turn of each round

      this.logger.log("StepStarted", {
        group: this.group,
        roundNumber,
        stepNumber: i + 1,
        agent: currentAgent.id,
        researchQuery,
      });

      const response = await currentAgent.generateResponse(this.getHistory());

      this.conversationHistory.push(`${currentAgent.id}: ${response}`);
      this.logger.log("MessageSent", {
        group: this.group,
        agent: currentAgent.id,
        message: response,
      });

      currentAgentIndex = (currentAgentIndex + 1) % this.agents.length;
    }

    this.logger.log("RoundEnded", {
      group: this.group,
      roundNumber,
      topic: this.topic,
    });
  }

  public async performResearch(
    query: string,
  ): Promise<{ learnings: string[]; visitedUrls: string[] }> {
    return deepResearch({
      query: query,
      breadth: this.researchBreadth,
      depth: this.researchDepth,
      llmConfig: this.researchLLMConfig,
      logger: this.logger,
    });
  }

  // TODO: Tokenize and return only the max context size tokens
  public getHistory(): string[] {
    return this.conversationHistory;
  }

  public getAgents(): Agent[] {
    return this.agents;
  }

  public getTopic(): string {
    return this.topic;
  }
}

export default Conversation;
