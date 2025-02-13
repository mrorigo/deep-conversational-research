import React, { useState } from "react";
import Modal from "./Modal";
import AgentForm from "./AgentForm";

function AgentCard({ agent, onAgentUpdate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">{agent.title}</h5>
        <p className="card-text">{agent.persona}</p>
      </div>
      <div className="card-footer">
        <button className="btn btn-secondary" onClick={openModal}>
          Edit
        </button>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Edit Agent">
        <AgentForm
          agent={agent}
          onSubmit={onAgentUpdate}
          onClose={closeModal}
        />
      </Modal>
    </div>
  );
}

export default AgentCard;
