import React, { useState } from "react";
import AgentCard from "./AgentCard";
import Modal from "./Modal";
import AgentForm from "./AgentForm";

function AgentGallery({ agents, onAgentCreate, onAgentUpdate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="d-flex flex-wrap">
                {agents.map((agent) => (
                  <AgentCard
                    key={agent.title}
                    agent={agent}
                    onAgentUpdate={onAgentUpdate}
                  />
                ))}
              <div
                className="card"
                style={{ width: "18rem", cursor: "pointer" }}
                onClick={openModal}
              >
                <div className="card-body d-flex justify-content-center align-items-center">
                  <h1 style={{ fontSize: "5rem", color: "grey" }}>+</h1>
                </div>
              </div>
              <Modal isOpen={isModalOpen} onClose={closeModal} title="Add Persona">
                <AgentForm onSubmit={onAgentCreate} onClose={closeModal} />
              </Modal>
            </div>
    </div>
  );
}

export default AgentGallery;
