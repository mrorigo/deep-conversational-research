import { ChatCompletionMessageParam } from "openai/resources";
import { callOpenAI, getSystemRole, LLMConfig } from "./utils.js";

export type Persona = {
  name: string;
  about_you: string;
  about_persona: string;
};

export async function describePersonas(
  llmConfig: LLMConfig,
  topic: string,
  personas: Persona[],
): Promise<string> {
  const prompt = `
    <task>
    You have been assigned to generate an introduction of a group of personas that will be participating in a research discussion. The personas represent different perspectives on a given topic and are designed to facilitate a diverse range of viewpoints in the conversation.
    </task>

    <discussion-topic>
    The topic of the discussion is "${topic}". The personas will be used to provide insights, opinions, and viewpoints on the topic.
    </discussion-topic>

    <guidelines>
    - Describe the group as if you were describing it to a single member in the group.
    - Keep the introduction concise and informative.
    - Include the name of each persona.
    - Do not provide the topic details, just focus on the personas.
    </guidelines>

    <example>
    The members of your group are:
    - Alice: A data scientist with a passion for machine learning.
    - Bob: An entrepreneur with a focus on sustainability.
    - Charlie: A student interested in artificial intelligence.
    - Dana: A researcher in the field of physics.
    </example>
    `;

  const messages = [
    { role: getSystemRole(llmConfig.model), content: prompt },
    {
      role: "user",
      content: `Personas:\n\`\`\`json\n${JSON.stringify(personas, null, 2)}\n\`\`\`\n`,
    },
  ] as ChatCompletionMessageParam[];

  try {
    const response = await callOpenAI(llmConfig, messages);
    return response.content;
  } catch (error) {
    throw new Error("Error describing personas: " + error);
  }
}

export async function generatePersonas(
  llmConfig: LLMConfig,
  topic: string,
  groups: number,
  agents: number,
): Promise<Persona[][]> {
  const agents_per_group = agents / groups;

  const personaPrompt = `
    <background>
        There will be a number of group discussions between AI agents on the topic "${topic}". The discussions will be held in ${groups} groups, each consisting of ${agents_per_group} participants. The participants will be assigned personas to represent different perspectives on the topic. The personas will be used to facilitate the discussions and provide a diverse range of viewpoints.
    </background>

    <task>
      Given the context, generate ${groups} groups of ${agents} personas each. Each persona should be distinct from the other in terms of their characteristics and preferences. The goal is to create personas that represent a diverse range of viewpoints on the topic. Each persona should have a name, and two variants of their character description: one in second person (about you) and one in third person (about the persona).
    </task>

    <response-format>
    Respond exclusively with 100% correct JSON in the following format:
    [
      [
        {
          "name": "Persona (first name only)",
          "about_you": "A brief description of the persona, two sentences long, in second person.",
          "about_persona": "A brief description of the persona, two sentences long, in third person."
        },
        ...
      ],
      [
        {
          "name": "Persona (first name only)",
          "about_you": "A brief description of the persona, two sentences long, in second person.",
          "about_persona": "A brief description of the persona, two sentences long, in third person."
          },
        ...
      ]
    ]
    </response-format>
  `;

  const messages = [
    { role: "user", content: personaPrompt },
  ] as ChatCompletionMessageParam[];

  const personas = await callOpenAI(llmConfig, messages);
  try {
    const content = personas.content.replace("```json", "").replace("```", "");
    console.log(
      `Generated personas for ${groups} groups of ${agents_per_group} agents each: \n${content}`,
    );
    return JSON.parse(content);
  } catch (error) {
    throw new Error("Error parsing personas response: " + error);
  }
}
