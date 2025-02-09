import Agent from "./Agent";

class Conversation {
  private agents: Agent[];
  private topic: string;
  private conversationHistory: string[];
  private enableResearch: boolean;

  constructor(agents: Agent[], topic: string, enableResearch: boolean = false) {
    this.agents = agents;
    this.topic = topic;
    this.conversationHistory = [];
    this.enableResearch = enableResearch;
  }

  public async startRound(
    roundNumber: number,
    sharedInsights: string[],
    maxSteps: number = 5,
  ): Promise<void> {
    console.log(
      `Starting round ${roundNumber} of conversation on topic: ${this.topic}`,
    );

    let currentPrompt = `Round ${roundNumber}: Let's continue discussing: ${this.topic}.`;
    let currentAgentIndex = 0;

    for (let i = 0; i < maxSteps; i++) {
      const currentAgent = this.agents[currentAgentIndex];
      console.log(`Agent ${currentAgent.id}'s turn`);

      // Force research on the first turn of each round
      const forceResearch = i === 0 && this.enableResearch;

      if (sharedInsights.length > 0) {
        const insightPrompt = `Here are some insights from other subgroups: ${sharedInsights.join(
          "\n",
        )}.  Consider these insights and generate follow up questions.`;
        currentPrompt += `\n${insightPrompt}`;
      }

      const response = await currentAgent.generateResponse(
        currentPrompt,
        forceResearch,
      );

      this.conversationHistory.push(`${currentAgent.id}: ${response}`);
      console.log(`${currentAgent.id}: ${response}`);

      // Prepare the next prompt based on the current response
      currentPrompt = `Agent ${currentAgent.id} said: ${response}. What are your thoughts?`;

      // Move to the next agent in a round-robin fashion
      currentAgentIndex = (currentAgentIndex + 1) % this.agents.length;
    }

    console.log(`Round ${roundNumber} finished.`);
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
