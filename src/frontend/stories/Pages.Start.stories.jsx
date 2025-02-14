import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Splash from "../components/Splash";

export default {
  title: "Pages/Start",
  component: undefined,
};

const Template = () => (
  <div>
    <Header />
    <Splash />
    <Footer />
  </div>
);

export const Default = Template.bind({});
Default.args = {};
