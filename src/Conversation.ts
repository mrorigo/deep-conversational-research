import Agent from "./Agent";
import getLogger from "./logger"; // Import the logger

class Conversation {
  private conversationHistory: string[] = [];

  constructor(
    private group: number,
    private agents: Agent[],
    private topic: string,
    private enableResearch: boolean = false,
  ) {
    const logger = getLogger();
    logger.log("ConversationStarted", {
      group,
      topic,
      agents: agents.map((agent) => agent.id),
    });
  }

  public async startRound(
    roundNumber: number,
    maxSteps: number = 5,
  ): Promise<void> {
    const logger = getLogger();
    logger.log("RoundStarted", {
      group: this.group,
      roundNumber,
      topic: this.topic,
    });

    let currentPrompt = `Round ${roundNumber}: Let's continue discussing: ${this.topic}.`;
    let currentAgentIndex = 0;

    for (let i = 0; i < maxSteps; i++) {
      const currentAgent = this.agents[currentAgentIndex];
      logger.log("StepStarted", {
        group: this.group,
        roundNumber,
        stepNumber: i + 1,
        agent: currentAgent.id,
      });

      // Force research on the first turn of each round
      const forceResearch = i === 0 && this.enableResearch;

      const response = await currentAgent.generateResponse(
        currentPrompt,
        forceResearch,
      );

      this.conversationHistory.push(`${currentAgent.id}: ${response}`);
      logger.log("MessageSent", {
        group: this.group,
        agent: currentAgent.id,
        message: response,
      });

      // Prepare the next prompt based on the current response
      currentPrompt = `Agent ${currentAgent.id} said: ${response}. What are your thoughts?`;

      // Move to the next agent in a round-robin fashion
      currentAgentIndex = (currentAgentIndex + 1) % this.agents.length;
    }

    logger.log("RoundEnded", {
      group: this.group,
      roundNumber,
      topic: this.topic,
    });
  }

  public getConversationHistory(): string[] {
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
