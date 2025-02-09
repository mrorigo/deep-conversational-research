import Agent from "./Agent";
import Conversation from "./Conversation";
import OpenAI from "openai";
import { callOpenAI } from "./utils";

class Network {
  private subgroups: Agent[][] = [];
  private sharedInsights: string[] = [];

  constructor(
    private agents: Agent[],
    private summary_model: string,
    private openai: OpenAI,
  ) {
    this.openai = openai;
  }

  public createSubgroups(subgroupSize: number): void {
    this.subgroups = [];
    for (let i = 0; i < this.agents.length; i += subgroupSize) {
      this.subgroups.push(this.agents.slice(i, i + subgroupSize));
    }
  }

  public async startConversations(
    topic: string,
    numRounds: number = 3,
    maxSteps: number = 5,
    enableResearch: boolean = false,
  ): Promise<string> {
    if (this.subgroups.length === 0) {
      throw new Error("No subgroups created. Please create subgroups first.");
    }

    const conversations: Conversation[] = this.subgroups.map(
      (agents) => new Conversation(agents, topic, enableResearch),
    );

    // Initial round of conversations
    console.log(`== Starting initial round of discussions...`);
    await Promise.all(
      conversations.map((conversation) =>
        conversation.startRound(1, [], maxSteps),
      ),
    );

    for (let round = 1; round < numRounds; round++) {
      console.log(`== Starting round ${round} of discussions...`);
      // Share insights after conversations
      await this.shareInsights(conversations);

      // Start new rounds of discussions based on shared insights
      await Promise.all(
        conversations.map((conversation) =>
          conversation.startRound(round + 1, this.sharedInsights, maxSteps),
        ),
      );
    }

    // Generate final report
    const finalReport = await this.generateFinalReport(topic);

    return finalReport;
  }

  private async shareInsights(conversations: Conversation[]): Promise<void> {
    console.log("Sharing insights between subgroups...");

    for (let i = 0; i < conversations.length; i++) {
      const conversation = conversations[i];
      const conversationHistory = conversation
        .getConversationHistory()
        .join("\n");

      try {
        const message = await this.summarizeConversation(conversationHistory);
        const summary = message?.content;

        console.log(`Summary of subgroup ${i + 1}: ${summary}`);

        this.sharedInsights.push(summary); // Store the shared insight

        // Share the summary with other subgroups (excluding the current one)
        for (let j = 0; j < this.subgroups.length; j++) {
          if (i !== j) {
            const otherSubgroup = this.subgroups[j];
            for (const agent of otherSubgroup) {
              // Add summary to conversation history directly
              this.addSummaryToConversationHistory(
                agent,
                `Summary from subgroup ${i + 1}: ${summary}`,
              );
            }
          }
        }
      } catch (error) {
        console.error(
          `Error summarizing conversation for subgroup ${i + 1}:`,
          error,
        );
      }
    }

    console.log("Insights shared.");
  }

  private addSummaryToConversationHistory(agent: Agent, summary: string): void {
    const conversationHistory = agent.getConversationHistory();
    conversationHistory.push({
      role: "user",
      content: summary,
    });
  }

  private async summarizeConversation(
    conversationHistory: string,
  ): Promise<any> {
    try {
      const message = await callOpenAI(this.openai, this.summary_model, [
        {
          role: this.getSystemRole(),
          content:
            "You are an expert summarizer tasked with distilling the key insights and arguments from a conversation. " +
            "Analyze the following dialogue and provide a concise summary, focusing on identifying the main topics discussed, " +
            "the key viewpoints expressed, and any areas of agreement or disagreement. Your summary should be informative and " +
            "highlight the most important aspects of the conversation.",
        },
        { role: "user", content: conversationHistory },
      ]);
      return message;
    } catch (error) {
      console.error("Error summarizing conversation:", error);
      return "Error summarizing conversation.";
    }
  }

  private async generateFinalReport(topic: string): Promise<string> {
    console.log("Generating final report...");

    try {
      const message = await this.summarizeSharedInsights(
        this.sharedInsights.join("\n"),
        topic,
      );
      const report = message?.content;
      console.log("Final Report:\n", report);
      return report;
    } catch (error) {
      console.error("Error generating final report:", error);
      return "Error generating final report.";
    }
  }

  // Handle system prompt based on the model (o-models don't accept system role)
  private getSystemRole(): "user" | "system" {
    return this.summary_model.startsWith("o") ? "user" : "system";
  }

  private async summarizeSharedInsights(
    sharedInsights: string,
    topic: string,
  ): Promise<any> {
    try {
      const message = await callOpenAI(this.openai, this.summary_model, [
        {
          role: this.getSystemRole(),
          content:
            `You are an AI research assistant tasked with generating a final report on the topic of "${topic}".  ` +
            `Based on the following shared insights from multiple AI agents, create a detailed research report covering key ` +
            `findings, conclusions, and any remaining open questions:`,
        },
        { role: "user", content: sharedInsights },
      ]);

      return message;
    } catch (error) {
      console.error("Error summarizing shared insights:", error);
      return "Error summarizing shared insights.";
    }
  }
}

export default Network;
