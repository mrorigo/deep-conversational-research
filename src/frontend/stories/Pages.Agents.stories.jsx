import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AgentGallery from "../components/AgentGallery";
import AgentCard from "../components/AgentCard";

export default {
  title: "Pages/Agents",
  component: AgentGallery,
};

const Template = (args) => (
  <div>
    <Header />
    <AgentGallery agents={args.agents} />
    <Footer />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  agents: [
    { name: "Agent 1", persona: "A helpful assistant" },
    { name: "Agent 2", persona: "A creative writer" },
    { name: "Agent 3", persona: "A knowledgeable researcher" },
  ],
};
