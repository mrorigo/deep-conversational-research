import React, { useState } from "react";
import PersonaCard from "./PersonaCard";
import Modal from "./Modal";
import PersonaForm from "./PersonaForm";

function PersonaGallery({ personas, onPersonaCreate, onPersonaUpdate }) {
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
        {personas.map((persona) => (
          <PersonaCard
            key={persona.title}
            persona={persona}
            onPersonaUpdate={onPersonaUpdate}
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
          <PersonaForm onSubmit={onPersonaCreate} onClose={closeModal} />
        </Modal>
      </div>
    </div>
  );
}

export default PersonaGallery;
