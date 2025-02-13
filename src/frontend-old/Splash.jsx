import React, { useEffect } from "react";

function Splash({ availableTopics, selectedTopicId, handleReplayTopic }) {
  useEffect(() => {
    if (availableTopics.length > 0 && selectedTopicId === null) {
      handleReplayTopic(availableTopics[0].id);
    }
  }, []);

  return (
    <div className="splash">
      <h1>Deep Conversational Research</h1>
      <p>
        Welcome to Deep Conversational Research! This application is a research
        tool for swarm intelligence conversations using AI agents.
      </p>
      <p>Start a new conversation, or replay an existing conversation.</p>
      <select onChange={(e) => handleReplayTopic(e.target.value)}>
        <option>Select a conversation</option>
        {availableTopics.map((topic) => (
          <option key={topic.id} value={topic.id}>
            {topic.topic}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Splash;
