import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ResearchGallery from "../components/ResearchGallery";

export default {
  title: "Pages/Research",
  component: undefined,
};

const Template = (args) => (
  <div>
    <Header />
    <ResearchGallery researchList={args.researchList} />
    <Footer />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  researchList: [
    {
      title: "First Research",
      description: "Some description of this research",
    },
  ],
};
