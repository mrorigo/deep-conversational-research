import React from "react";
import AgentCard from "../components/AgentCard";

export default {
  title: "Components/AgentCard",
  component: AgentCard,
};

const Template = (args) => <AgentCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  agent: {
    name: "Example Agent",
    persona: "A helpful AI assistant.",
  },
};
