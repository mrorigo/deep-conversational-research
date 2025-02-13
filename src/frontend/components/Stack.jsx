import React from "react";

function Stack({ children, orientation = "vertical" }) {
  const className = `d-flex ${orientation === "horizontal" ? "flex-row" : "flex-column"}`;

  return <div className={className}>{children}</div>;
}

export default Stack;
