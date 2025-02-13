import React from "react";

function AgentCard({ agent }) {
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">{agent.name}</h5>
        <p className="card-text">{agent.persona}</p>
      </div>
    </div>
  );
}

export default AgentCard;
