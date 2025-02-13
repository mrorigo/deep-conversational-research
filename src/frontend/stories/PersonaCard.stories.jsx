import React from "react";
import PersonaCard from "../components/PersonaCard";

export default {
  title: "Components/PersonaCard",
  component: PersonaCard,
};

const Template = (args) => <PersonaCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  persona: {
    title: "Example Persona",
    persona: "A talented actor.",
  },
};
