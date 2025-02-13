import React, { useState } from "react";
import Modal from "./Modal";
import PersonaForm from "./PersonaForm";

function PersonaCard({ persona, onPersonaUpdate }) {
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
        <h5 className="card-title">{persona.title}</h5>
        <p className="card-text">{persona.persona}</p>
      </div>
      <div className="card-footer">
        <button className="btn btn-secondary" onClick={openModal}>
          Edit
        </button>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Edit Persona">
        <PersonaForm
          persona={persona}
          onSubmit={onPersonaUpdate}
          onClose={closeModal}
        />
      </Modal>
    </div>
  );
}

export default PersonaCard;
