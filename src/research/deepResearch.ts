import OpenAI from "openai";
import * as dotenv from "dotenv";
import DuckDuckGoSearch from "./ddgs"; // Import DuckDuckGoSearch
import { getSystemRole } from "../utils";

dotenv.config();

interface DeepResearchParams {
  query: string;
  breadth: number;
  depth: number;
}

interface AgentContext {
  model: string;
  openai: OpenAI;
  callOpenAI: (
    openai: OpenAI,
    model: string,
    messages: any,
    options?: any,
    retries?: number,
  ) => Promise<any>;
}

const systemPrompt = () => {
  const now = new Date().toISOString();
  return `You are an expert researcher. Today is ${now}. Follow these instructions when responding:
  - You may be asked to research subjects that is after your knowledge cutoff, assume the user is right when presented with news.
  - The user is a highly experienced analyst, be as detailed as possible and make sure your response is correct.
  - Be highly organized.
  - Suggest solutions that I didn't think about.
  - Be proactive and anticipate my needs.
  - Treat me as an expert in all subject matter.
  - Mistakes erode my trust, so be accurate and thorough.
  - Provide detailed explanations, I'm comfortable with lots of detail.
  - Value good arguments over authorities, the source is irrelevant.
  - Consider new technologies and contrarian ideas, not just the conventional wisdom.
  - You may use high levels of speculation or prediction, just flag it for me.`;
};

async function generateSerpQueries({
  query,
  numQueries = 3,
  learnings,
  agentContext,
}: {
  query: string;
  numQueries?: number;
  learnings?: string[];
  agentContext: AgentContext;
}) {
  const model = agentContext.model;
  try {
    const message = await agentContext.callOpenAI(
      agentContext.openai,
      model,
      [
        {
          role: getSystemRole(model),
          content: systemPrompt(),
        },
        {
          role: "user",
          content:
            `Given the following prompt from the user, generate a list of SERP queries to research the topic. Return a maximum of ${numQueries} queries, but feel free to return less if the original prompt is clear. Make sure each query is unique and not similar to each other: <prompt>${query}</prompt>\n\n${
              learnings
                ? `Here are some learnings from previous research, use them to generate more specific queries: ${learnings.join(
                    "\n",
                  )}`
                : ""
            }` +
            `Respond exclusiveliy in the json format below:\n\n{queries: ["query 1", "query 2", ...]}`,
        },
      ],
      { response_format: { type: "json_object" } },
    );

    const parsedResponse = message?.content || "No response";

    // Attempt to parse the response as a JSON object.  If it's valid JSON, use it.
    let queries: { query: string; researchGoal: string }[];
    try {
      const jsonResponse = JSON.parse(parsedResponse);
      if (
        jsonResponse &&
        jsonResponse.queries &&
        Array.isArray(jsonResponse.queries)
      ) {
        console.log(
          `Created ${jsonResponse.queries.length} queries from json`,
          jsonResponse.queries,
        );
        queries = jsonResponse.queries.map((q: string) => ({
          query: q,
          researchGoal: "Research this query.",
        }));
      } else {
        console.warn("Unexpected JSON format, attempting manual parse");
        queries = [];
      }
    } catch (e) {
      console.warn("Could not parse JSON response, attempting manual parse", e);
      queries = [];
    }

    if (queries.length === 0) {
      //Fallback to manual extraction if json parse fails.
      const extractedQueries = parsedResponse
        .split("\n")
        .map((q: any) => ({ query: q.trim() }))
        .filter((q: any) => q.query.length > 0)
        .filter((x: any) => parseInt(x.query) >= 0)
        .map((x: any) => ({
          query: x.query.replace(/^[\-0-9\.]+/, "").trim(),
        }));
      console.log(
        `Created ${extractedQueries.length} queries from manual parse`,
        extractedQueries,
      );
      queries = extractedQueries.slice(0, numQueries).map((q: any) => ({
        query: q.query,
        researchGoal: "Research this query.",
      }));
    }

    return queries;
  } catch (error) {
    console.error("Error generating SERP queries:", error);
    return [];
  }
}

async function scrapeContent(url: string): Promise<string | null> {
  try {
    const firecrawlUrl = process.env.FIRECRAWL_URL;
    if (!firecrawlUrl) {
      throw new Error("FIRECRAWL_URL is not set in the environment.");
    }

    const response = await fetch(`${firecrawlUrl}/v1/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer DUMMY`,
      },
      body: JSON.stringify({
        url: url,
        formats: ["markdown"],
      }),
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.data?.markdown || null;
  } catch (error) {
    console.error(`Error scraping content from ${url}:`, error);
    return null;
  }
}

async function processSerpResult({
  query,
  results,
  numLearnings = 3,
  numFollowUpQuestions = 3,
  agentContext,
}: {
  query: string;
  results: any[];
  numLearnings?: number;
  numFollowUpQuestions?: number;
  agentContext: AgentContext;
}) {
  const model = agentContext.model;

  const contents = [];
  for (const result of results) {
    const content = await scrapeContent(result.href);
    if (content) {
      contents.push(content);
    }
  }
  console.log(
    `deepResearch: Ran query "${query}", found ${contents.length} contents`,
  );

  try {
    const message = await agentContext.callOpenAI(
      agentContext.openai,
      model,
      [
        {
          role: getSystemRole(model),
          content: systemPrompt(),
        },
        {
          role: "user",
          content:
            `Given the following contents from a SERP search for the query <query>${query}</query>, generate a list of learnings from the contents. Return a maximum of ${numLearnings} learnings, but feel free to return less if the contents are clear. Make sure each learning is unique and not similar to each other. The learnings should be concise and to the point, as detailed and information dense as possible. Make sure to include any entities like people, places, companies, products, things, etc in the learnings, as well as any exact metrics, numbers, or dates. The learnings will be used to research the topic further.\n\n<contents>${contents
              .map((content) => `<content>\n${content}\n</content>`)
              .join("\n")}</contents>` +
            `Respond exclusiveliy in the json format below:\n\n{learnings: ["learning 1", "learning 2", "learning 3"], followUpQuestions: ["question 1", "question 2", "question 3"]}`,
        },
      ],
      { response_format: { type: "json_object" } },
    );

    const parsedResponse = message?.content || "No response";

    try {
      const jsonResponse = JSON.parse(parsedResponse);
      if (
        jsonResponse &&
        jsonResponse.learnings &&
        Array.isArray(jsonResponse.learnings) &&
        jsonResponse.followUpQuestions &&
        Array.isArray(jsonResponse.followUpQuestions)
      ) {
        console.log(
          `Created ${jsonResponse.learnings.length} learnings from json`,
          jsonResponse.learnings,
        );
        return jsonResponse;
      } else {
        console.warn("Unexpected JSON format, attempting manual parse");
      }
    } catch (e) {
      console.warn("Could not parse JSON response, attempting manual parse", e);
    }

    const learnings = parsedResponse.split("\n").map((l: string) => l.trim());
    return {
      learnings: learnings.slice(0, numLearnings),
      followUpQuestions: [],
    };
  } catch (error) {
    console.error("Error processing SERP result:", error);
    return { learnings: [], followUpQuestions: [] };
  }
}

async function writeFinalReport({
  prompt,
  learnings,
  visitedUrls,
  agentContext,
}: {
  prompt: string;
  learnings: string[];
  visitedUrls: string[];
  agentContext: AgentContext;
}) {
  const model = agentContext.model;

  try {
    const message = await agentContext.callOpenAI(agentContext.openai, model, [
      {
        role: getSystemRole(model),
        content: systemPrompt(),
      },
      {
        role: "user",
        content: `Given the following prompt from the user, write a final report on the topic using the learnings from research. Make it as as detailed as possible, aim for 3 or more pages, include ALL the learnings from research:\n\n<prompt>${prompt}</prompt>\n\nHere are all the learnings from previous research:\n\n<learnings>\n${learnings.map((learning) => `<learning>\n${learning}\n</learning>`).join("\n")}\n</learnings>`,
      },
    ]);

    const reportMarkdown = message?.content || "No report generated.";

    // Append the visited URLs section to the report
    const urlsSection = `\n\n## Sources\n\n${visitedUrls.map((url) => `- ${url}`).join("\n")}`;
    return reportMarkdown + urlsSection;
  } catch (error) {
    console.error("Error writing final report:", error);
    return "Error writing final report.";
  }
}

export async function deepResearch({
  query,
  breadth,
  depth,
  learnings = [],
  visitedUrls = [],
  agentContext,
}: {
  query: string;
  breadth: number;
  depth: number;
  learnings?: string[];
  visitedUrls?: string[];
  agentContext: AgentContext;
}): Promise<{ learnings: string[]; visitedUrls: string[] }> {
  if (!agentContext) {
    throw new Error("Agent context is required for deep research.");
  }

  const serpQueries = await generateSerpQueries({
    query,
    learnings,
    numQueries: breadth,
    agentContext,
  });

  let allLearnings: string[] = [...learnings];
  let allUrls: string[] = [...visitedUrls];

  for (const serpQuery of serpQueries) {
    try {
      // Use DuckDuckGoSearch instead of google_search
      const ddgs = new DuckDuckGoSearch();
      if (serpQuery.query) {
        const results = await ddgs.text(
          serpQuery.query,
          "wt-wt",
          "moderate",
          null,
          "html",
          5,
        ); // Adjust parameters as needed
        const newUrls = results.map((result: any) => result.href);

        const newLearnings = await processSerpResult({
          query: serpQuery.query,
          results: results,
          numFollowUpQuestions: Math.ceil(breadth / 2),
          agentContext,
        });

        allLearnings = [...allLearnings, ...newLearnings.learnings];
        allUrls = [...allUrls, ...newUrls];

        if (depth - 1 > 0) {
          console.log(
            `Researching deeper, breadth: ${breadth / 2}, depth: ${depth - 1}`,
          );

          const nextQuery = `
            Previous research goal: ${serpQuery.researchGoal}
            Follow-up research directions: ${newLearnings.followUpQuestions.map((q: string) => `\n${q}`).join("")}
          `.trim();

          const deeperResearch = await deepResearch({
            query: nextQuery,
            breadth: breadth / 2,
            depth: depth - 1,
            learnings: allLearnings,
            visitedUrls: allUrls,
            agentContext,
          });

          allLearnings = [...allLearnings, ...deeperResearch.learnings];
          allUrls = [...allUrls, ...deeperResearch.visitedUrls];
        }
      } else {
        console.warn("serpQuery.query is undefined, skipping search.");
      }
    } catch (e: any) {
      console.error(`Error running query: ${serpQuery.query}: `, e);
    }
  }

  return {
    learnings: [...new Set(allLearnings)],
    visitedUrls: [...new Set(allUrls)],
  };
}
