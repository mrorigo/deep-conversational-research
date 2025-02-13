import React, { useEffect } from "react";
import PersonaGallery from "../components/PersonaGallery";

function PersonasPage() {
  const [personas, setPersonas] = React.useState([]);

  useEffect(() => {
    setPersonas([
      { name: "Persona 1", persona: "A helpful assistant" },
      { name: "Persona 2", persona: "A creative writer" },
      { name: "Persona 3", persona: "A knowledgeable researcher" },
    ]);
  }, []);

  const handlePersonaCreate = (newPersona) => {
    setPersonas([...personas, newPersona]);
  };

  const handlePersonaUpdate = (updatedPersona) => {
    setPersonas(
      personas.map((persona) =>
        persona.name === updatedPersona.name ? updatedPersona : persona,
      ),
    );
  };

  return (
    <div>
      <PersonaGallery
        personas={personas}
        onAgentCreate={handlePersonaCreate}
        onAgentUpdate={handlePersonaUpdate}
      />
    </div>
  );
}

export default PersonasPage;
