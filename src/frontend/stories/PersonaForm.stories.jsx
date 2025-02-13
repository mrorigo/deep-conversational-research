import React from "react";
import PersonaForm from "../components/PersonaForm";

export default {
  title: "Components/PersonaForm",
  component: PersonaForm,
  argTypes: {
    onSubmit: { action: "submitted" },
  },
};

const Template = (args) => <PersonaForm {...args} />;

export const Default = Template.bind({});
Default.args = {};
