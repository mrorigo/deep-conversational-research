import Agent from "./Agent.js";
import Conversation from "./Conversation.js";
import { callOpenAI, getSystemRole, LLMConfig } from "./utils.js";
import { Logger } from "./logger.js";
import { generateSerpQueries } from "./research/deepResearch.js";

class Network {
  private sharedInsights: string[] = [];

  constructor(
    private groups: Agent[][],
    private summaryLLMConfig: LLMConfig,
    private researchLLMConfig: LLMConfig,
    private logger: Logger,
  ) {}

  public async startConversations(
    topic: string,
    numRounds: number = 3,
    maxSteps: number = 5,
  ): Promise<string[]> {
    if (this.groups.length === 0) {
      throw new Error("No groups created. Please create groups first.");
    }

    const conversations: Conversation[] = this.groups.map(
      (agents, i: number) => {
        return new Conversation(
          i,
          agents,
          topic,
          this.logger,
          this.researchLLMConfig,
        );
      },
    );

    for (let round = 0; round < numRounds; round++) {
      console.log(`== Starting round ${round} of discussions...`);
      const serp: string[] = await generateSerpQueries({
        query: topic,
        learnings: this.sharedInsights,
        numQueries: this.groups.length,
        llmConfig: this.summaryLLMConfig,
      });
      console.log("SERP queries generated:", serp);

      await Promise.all(
        conversations.map((conversation, i) =>
          conversation.startRound(round + 1, serp[i], maxSteps),
        ),
      );
      await this.shareInsights(conversations, maxSteps);
    }

    return await this.generateFinalReport(topic);
  }

  private async shareInsights(
    conversations: Conversation[],
    maxSteps: number,
  ): Promise<void> {
    console.log("Sharing insights between subgroups...");

    for (let i = 0; i < conversations.length; i++) {
      const conversation = conversations[i];
      const conversationHistory = conversation.getHistory();

      try {
        const messages = conversationHistory.slice(-(maxSteps + 1));
        const message = await this.summarizeConversation(
          conversation.getTopic(),
          messages,
          maxSteps,
        );
        const summary = message?.content;

        console.log(`Summary of subgroup ${i + 1}: ${summary}`);

        this.sharedInsights.push(summary); // Store the shared insight

        // Share the summary with other subgroups (excluding the current one)
        for (let j = 0; j < this.groups.length; j++) {
          conversations[j]
            .getHistory()
            .push(`Summary of previous round: ${summary}`);
          if (i !== j) {
            conversations[j]
              .getHistory()
              .push(`Summary from subgroup ${i + 1}: ${summary}`);
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

  private async summarizeConversation(
    topic: string,
    conversationHistory: string[],
    maxSteps: number,
  ): Promise<any> {
    try {
      // Summarize the last N steps of the conversation (plus # subgroups to include shared insights, +1 for previous summary)
      conversationHistory = conversationHistory.slice(
        -Math.min(
          conversationHistory.length,
          maxSteps + this.groups.length + 1,
        ),
      );
      console.log(
        "Summarizing conversation:\n",
        conversationHistory.join("\n"),
      );
      const message = await callOpenAI(this.summaryLLMConfig, [
        {
          role: getSystemRole(this.summaryLLMConfig.model),
          content:
            "You are an expert summarizer tasked with distilling the key insights and arguments from a partial conversation between experts. " +
            "The target audience is other groups of experts discussing similar topics, and the intent is to cross-pollinate ideas and insights. " +
            "Analyze the following dialogue and provide a concise summary, focusing on identifying the main insights discussed, " +
            "the key viewpoints expressed, and areas of agreement or disagreement. Try to keep it to a few sentences.",
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
      const message = await callOpenAI(this.summaryLLMConfig, [
        {
          role: getSystemRole(this.summaryLLMConfig.model),
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
      const message = await callOpenAI(this.summaryLLMConfig, [
        {
          role: getSystemRole(this.summaryLLMConfig.model),
          content:
            `You are an AI research assistant tasked with generating a comprehensive final report based on shared insights collected during research on a user query:\n` +
            `<user-query>${topic}</user-query>. ` +
            `Create a detailed research report covering all key findings, conclusions, and any remaining open questions.`,
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
