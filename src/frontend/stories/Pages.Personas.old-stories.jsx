import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PersonaGallery from "../components/PersonaGallery";

export default {
  title: "Pages/Personas",
  component: PersonaGallery,
};

const Template = (args) => (
  <div>
    <Header />
    <PersonaGallery personas={args.personas} />
    <Footer />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  personas: [
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
