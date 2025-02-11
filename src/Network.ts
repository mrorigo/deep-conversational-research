import Agent from "./Agent.js";
import Conversation from "./Conversation.js";
import OpenAI from "openai";
import { callOpenAI, getSystemRole } from "./utils.js";
import { Logger } from "./logger.js";

class Network {
  private subgroups: Agent[][] = [];
  private sharedInsights: string[] = [];

  constructor(
    private agents: Agent[],
    private summary_model: string,
    private openai: OpenAI,
    private logger: Logger,
  ) {}

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
  ): Promise<string[]> {
    if (this.subgroups.length === 0) {
      throw new Error("No subgroups created. Please create subgroups first.");
    }

    const conversations: Conversation[] = this.subgroups.map(
      (agents, i: number) =>
        new Conversation(i, agents, topic, enableResearch, this.logger),
    );

    // Initial round of conversations
    console.log(`== Starting initial round of discussions...`);
    await Promise.all(
      conversations.map((conversation) => conversation.startRound(1, maxSteps)),
    );

    for (let round = 1; round < numRounds; round++) {
      console.log(`== Starting round ${round} of discussions...`);
      // Share insights after conversations
      await this.shareInsights(conversations, maxSteps);

      // Start new rounds of discussions based on shared insights
      await Promise.all(
        conversations.map((conversation) =>
          conversation.startRound(round + 1, maxSteps),
        ),
      );
    }

    // Share insights once more after final round
    await this.shareInsights(conversations, maxSteps);

    return await this.generateFinalReport(topic);
  }

  private async shareInsights(
    conversations: Conversation[],
    maxSteps: number,
  ): Promise<void> {
    console.log("Sharing insights between subgroups...");

    for (let i = 0; i < conversations.length; i++) {
      const conversation = conversations[i];
      const conversationHistory = conversation.getConversationHistory();

      try {
        const message = await this.summarizeConversation(
          conversation.getTopic(),
          conversationHistory,
          maxSteps,
        );
        const summary = message?.content;

        console.log(`Summary of subgroup ${i + 1}: ${summary}`);

        this.sharedInsights.push(summary); // Store the shared insight

        // Share the summary with other subgroups (excluding the current one)
        for (let j = 0; j < this.subgroups.length; j++) {
          if (i !== j) {
            const otherSubgroup = this.subgroups[j];
            for (const agent of otherSubgroup) {
              this.addSummaryToConversationHistory(
                agent,
                `Summary from subgroup ${i + 1}: ${summary}`,
              );
            }
            this.logger.log("InsightsShared", {
              fromGroup: j,
              toGroup: i,
              summary,
            });
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
    topic: string,
    conversationHistory: string[],
    maxSteps: number,
  ): Promise<any> {
    try {
      // Summarize the last N steps of the conversation (plus # subgroups for shared insights)
      conversationHistory = conversationHistory.slice(
        -Math.min(conversationHistory.length, maxSteps + this.subgroups.length),
      );
      console.log(
        "Summarizing conversation:\n",
        conversationHistory.join("\n"),
      );
      const message = await callOpenAI(this.openai, this.summary_model, [
        {
          role: getSystemRole(this.summary_model),
          content:
            "You are an expert summarizer tasked with distilling the key insights and arguments from a conversation between experts. " +
            "The target audience is other groups of experts discussing similar topics. " +
            "Analyze the following dialogue and provide a concise summary, focusing on identifying the main insights discussed, " +
            "the key viewpoints expressed, and areas of agreement or disagreement.",
        },
        {
          role: "user",
          content:
            `Conversation on the topic "${topic}":\n` +
            conversationHistory.join("\n"),
        },
      ]);
      return message;
    } catch (error) {
      console.error("Error summarizing conversation:", error);
      return "Error summarizing conversation.";
    }
  }

  private async generateFinalReport(topic: string): Promise<string[]> {
    console.log("Generating final report...");

    this.logger.log("AllSharedInsights", {
      insights: this.sharedInsights,
    });

    try {
      const message = await this.summarizeSharedInsights(
        this.sharedInsights.join("\n"),
        topic,
      );
      const report = message?.content;
      console.log("Final Report:\n", report);

      const revisedReport = await this.reviseFinalReport(report);
      return [report, revisedReport];
    } catch (error) {
      console.error("Error generating final report:", error);
      return ["Error generating final report."];
    }
  }

  private async reviseFinalReport(report: string): Promise<string> {
    try {
      const message = await callOpenAI(this.openai, this.summary_model, [
        {
          role: getSystemRole(this.summary_model),
          content:
            "You are an AI research assistant tasked with revising a research report. " +
            "Based on the following report, make any necessary revisions to improve clarity, coherence, and overall quality." +
            "Respond exclusively with the revised report.",
        },
        { role: "user", content: report },
      ]);

      return message?.content;
    } catch (error) {
      console.error("Error revising final report:", error);
      return "Error revising final report.";
    }
  }

  private async summarizeSharedInsights(
    sharedInsights: string,
    topic: string,
  ): Promise<any> {
    try {
      const message = await callOpenAI(this.openai, this.summary_model, [
        {
          role: getSystemRole(this.summary_model),
          content:
            `You are an AI research assistant tasked with generating a comprehensive final report on the topic of "${topic}".  ` +
            `Based on the following shared insights from multiple discussions, create a detailed research report covering key ` +
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
