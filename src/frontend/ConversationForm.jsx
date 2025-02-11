import React, { useState, useRef } from "react";

// Function to generate a unique conversation ID from the topic
function generateConversationId(topic) {
  let hash = 0;
  for (let i = 0; i < topic.length; i++) {
    const char = topic.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }
  return btoa(topic).substring(0, 12) + "-" + Math.abs(hash).toString(16);
}

function ConversationForm({
  onSubmit,
  topic,
  setTopic,
  numGroups,
  setNumGroups,
  numAgents,
  setNumAgents,
  enableResearch,
  setEnableResearch,
  researchDepth,
  setResearchDepth,
  researchBreadth,
  setResearchBreadth,
  models,
  setModels,
  rounds,
  setRounds,
  steps,
  setSteps,
}) {
  const [errors, setErrors] = useState({});
  const modalRef = useRef(null);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!topic) {
      newErrors.topic = "Topic is required";
      isValid = false;
    }

    if (!numGroups || numGroups <= 0) {
      newErrors.numGroups = "Number of groups must be greater than 0";
      isValid = false;
    }

    if (!numAgents || numAgents <= 1) {
      newErrors.numAgents = "Number of agents must be greater than 1";
      isValid = false;
    }

    if (numAgents % numGroups !== 0) {
      newErrors.numAgents =
        "Number of agents must be divisible by the number of groups";
      isValid = false;
    }

    if (!models) {
      newErrors.models = "Models are required";
      isValid = false;
    }

    if (!rounds || rounds <= 0) {
      newErrors.rounds = "Rounds must be greater than 0";
      isValid = false;
    }

    if (!steps || steps <= 1) {
      newErrors.steps = "Steps must be greater than 1";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateForm()) {
      // Generate conversation ID
      const conversationId = generateConversationId(topic);

      onSubmit({
        topic: topic,
        num_groups: parseInt(numGroups),
        num_agents: parseInt(numAgents),
        enableResearch: enableResearch,
        researchDepth: parseInt(researchDepth),
        researchBreadth: parseInt(researchBreadth),
        models: models.split(","),
        rounds: parseInt(rounds),
        steps: parseInt(steps),
        conversationId: conversationId,
      });

      // Close the modal
      window.$("#conversationModal").modal("hide");
    }
  };

  return (
    <form id="conversationForm" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="topic">Topic:</label>
        <input
          type="text"
          className="form-control"
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
        />
        {errors.topic && <div className="text-danger">{errors.topic}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="num_groups">Number of Groups:</label>
        <input
          type="number"
          className="form-control"
          id="num_groups"
          value={numGroups}
          onChange={(e) => setNumGroups(e.target.value)}
          required
        />
        {errors.numGroups && (
          <div className="text-danger">{errors.numGroups}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="num_agents">Number of Agents:</label>
        <input
          type="number"
          className="form-control"
          id="num_agents"
          value={numAgents}
          onChange={(e) => setNumAgents(e.target.value)}
          required
        />
        {errors.numAgents && (
          <div className="text-danger">{errors.numAgents}</div>
        )}
      </div>

      <div className="form-group form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id="enableResearch"
          checked={enableResearch}
          onChange={(e) => setEnableResearch(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="enableResearch">
          Enable Research
        </label>
      </div>

      <div className="form-group">
        <label htmlFor="researchDepth">Research Depth:</label>
        <input
          type="number"
          className="form-control"
          id="researchDepth"
          value={researchDepth}
          onChange={(e) => setResearchDepth(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="researchBreadth">Research Breadth:</label>
        <input
          type="number"
          className="form-control"
          id="researchBreadth"
          value={researchBreadth}
          onChange={(e) => setResearchBreadth(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="models">Models (comma-separated):</label>
        <input
          type="text"
          className="form-control"
          id="models"
          value={models}
          onChange={(e) => setModels(e.target.value)}
          required
        />
        {errors.models && <div className="text-danger">{errors.models}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="rounds">Rounds:</label>
        <input
          type="number"
          className="form-control"
          id="rounds"
          value={rounds}
          onChange={(e) => setRounds(e.target.value)}
          required
        />
        {errors.rounds && <div className="text-danger">{errors.rounds}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="steps">Steps per round:</label>
        <input
          type="number"
          className="form-control"
          id="steps"
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          required
        />
        {errors.steps && <div className="text-danger">{errors.steps}</div>}
      </div>

      <button type="submit" className="btn btn-primary">
        Start Conversation
      </button>
    </form>
  );
}

export default ConversationForm;
