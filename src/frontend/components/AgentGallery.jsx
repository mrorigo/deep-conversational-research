import React from "react";
import AgentCard from "./AgentCard";

function AgentGallery({ agents }) {
  return (
    <div className="d-flex flex-wrap">
      {agents.map((agent) => (
        <AgentCard key={agent.name} agent={agent} />
      ))}
    </div>
  );
}

export default AgentGallery;
