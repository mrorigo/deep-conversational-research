import React from "react";
import Card from "../components/Card";

export default {
  title: "Components/Card",
  component: Card,
};

const Template = (args) => (
  <Card {...args}>This is some content inside the card.</Card>
);

export const Default = Template.bind({});
Default.args = {
  title: "My Card",
};

export const WithImage = Template.bind({});
WithImage.args = {
  title: "Card with Image",
  image: "https://via.placeholder.com/150",
};
