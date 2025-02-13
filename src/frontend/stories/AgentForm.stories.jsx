import React from "react";
import AgentForm from "../components/AgentForm";

export default {
  title: "Components/AgentForm",
  component: AgentForm,
  argTypes: {
    onSubmit: { action: "submitted" },
  },
};

const Template = (args) => <AgentForm {...args} />;

export const Default = Template.bind({});
Default.args = {};
