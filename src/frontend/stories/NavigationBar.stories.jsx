import React from "react";
import NavigationBar from "../components/NavigationBar";

export default {
  title: "Components/NavigationBar",
  component: NavigationBar,
};

const Template = (args) => <NavigationBar {...args} />;

export const Default = Template.bind({});
Default.args = {};
