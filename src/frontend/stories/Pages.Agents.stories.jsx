import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AgentGallery from "../components/AgentGallery";

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
    {
      title: "Conservative Environmentalist",
      persona: "You are a conservative environmentalist",
    },
    { title: "Author", persona: "You are a world renowned author" },
    {
      title: "Physics Researcher",
      persona: "You are a knowledgeable physics researcher",
    },
  ],
};
