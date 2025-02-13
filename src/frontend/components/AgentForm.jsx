import React, { useState } from "react";

function AgentForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [persona, setPersona] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ name, persona });
    setName("");
    setPersona("");
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            className="form-control"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="persona">Persona:</label>
          <textarea
            className="form-control"
            id="persona"
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
}

export default AgentForm;
