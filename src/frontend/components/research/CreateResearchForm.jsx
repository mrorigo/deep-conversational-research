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

function CreateResearchForm({ onSubmit }) {
  const [topic, setTopic] = useState("");
  const [numGroups, setNumGroups] = useState(2);
  const [numAgents, setNumAgents] = useState(4);
  const [enableResearch, setEnableResearch] = useState(false);
  const [researchDepth, setResearchDepth] = useState(1);
  const [researchBreadth, setResearchBreadth] = useState(3);
  const initialModelsString =
    process.env.OPENAI_MODELS || "gemini-2.0-flash,gemini-1.5-flash";
  const availableModels = initialModelsString.split(",");
  const [models, setModels] = useState(
    availableModels.length > 0 ? [availableModels[0]] : [],
  ); // Initialize with the first model selected if available
  const [rounds, setRounds] = useState(2);
  const [steps, setSteps] = useState(6);
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

    if (!models || models.length === 0) {
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
        models: models,
        rounds: parseInt(rounds),
        steps: parseInt(steps),
        conversationId: conversationId,
      });
    }
  };

  return (
    <form id="conversationForm" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="topic">Topic / Context:</label>
        <textarea
          placeholder="Why are Ccoa prices suddenly skyrocketing in 2025?"
          rows="3"
          className="form-control"
          id="topic"
          onChange={(e) => setTopic(e.target.value)}
          required
        >
          {topic}
        </textarea>
        {errors.topic && <div className="text-danger">{errors.topic}</div>}
      </div>

      <div className="row">
        <div className="form-group col-md-6">
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

        <div className="form-group col-md-6">
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
        {numGroups && numAgents && numAgents % numGroups !== 0 && (
          <div className="col-md-12">
            <div className="alert alert-warning mt-2" role="alert">
              ⚠️ The number of agents must be divisible by the number of groups.
            </div>
          </div>
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

      {enableResearch && (
        <>
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
        </>
      )}

      <div className="form-group">
        <label htmlFor="models">Models:</label>
        {availableModels.map((model) => (
          <div className="form-check" key={model}>
            <input
              className="form-check-input"
              type="checkbox"
              value={model}
              id={`model-${model}`}
              checked={models.includes(model)}
              onChange={(e) => {
                if (e.target.checked) {
                  setModels([...models, model]);
                } else {
                  setModels(models.filter((m) => m !== model));
                }
              }}
            />
            <label className="form-check-label" htmlFor={`model-${model}`}>
              {model}
            </label>
          </div>
        ))}
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

      {numGroups && numAgents && steps && numAgents / numGroups > steps && (
        <div className="alert alert-warning" role="alert">
          ⚠️ The number of steps per round is less than the number of agents per
          group. Not all agents will be able to speak in each round. Consider
          decreasing the number of agents or increasing the steps per round.
        </div>
      )}

      <button type="submit" className="btn btn-primary">
        Start Conversation
      </button>
    </form>
  );
}

export default CreateResearchForm;
