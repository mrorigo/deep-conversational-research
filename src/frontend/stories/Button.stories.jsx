export default {
  title: "Components/Button",
  component: Button,
  argTypes: {
    onClick: { action: "clicked" },
  },
};

const Template = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: "Click Me",
};
import React from "react";
import Button from "../components/Button";
