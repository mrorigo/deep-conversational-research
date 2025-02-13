import React from "react";
import Stack from "../components/Stack";

export default {
  title: "Components/Stack",
  component: Stack,
  argTypes: {
    orientation: { control: "radio", options: ["vertical", "horizontal"] },
  },
};

const Template = (args) => (
  <Stack {...args}>
    <div style={{ width: "50px", height: "50px", backgroundColor: "red" }} />
    <div style={{ width: "50px", height: "50px", backgroundColor: "green" }} />
    <div style={{ width: "50px", height: "50px", backgroundColor: "blue" }} />
  </Stack>
);

export const Vertical = Template.bind({});
Vertical.args = {
  orientation: "vertical",
};

export const Horizontal = Template.bind({});
Horizontal.args = {
  orientation: "horizontal",
};
