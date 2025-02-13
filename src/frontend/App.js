import React, { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AgentGallery from "./components/AgentGallery";
import "bootstrap/dist/css/bootstrap.min.css";
import "frontend/src/App.css";

function App() {
  const [agents, setAgents] = useState([
    { name: "Agent 1", persona: "A helpful assistant" },
    { name: "Agent 2", persona: "A creative writer" },
    { name: "Agent 3", persona: "A knowledgeable researcher" },
  ]);

  const handleAgentCreate = (newAgent) => {
    setAgents([...agents, newAgent]);
  };

  const handleAgentUpdate = (updatedAgent) => {
    setAgents(
      agents.map((agent) =>
        agent.name === updatedAgent.name ? updatedAgent : agent,
      ),
    );
  };

  return (
    <div>
      <Header />
      <AgentGallery
        agents={agents}
        onAgentCreate={handleAgentCreate}
        onAgentUpdate={handleAgentUpdate}
      />
      <Footer />
    </div>
  );
}

export default App;
