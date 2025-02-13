import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import ConversationForm from "./ConversationForm";
import Splash from "./Splash";
import Footer from "./Footer";
import ConversationHandler from "./ConversationHandler";

function App() {
  const [ws, setWs] = useState(null);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [conversationStarted, setConversationStarted] = useState(false);

  useEffect(() => {
    const newWs = new WebSocket("ws://localhost:3210/websocket");

    newWs.onopen = () => {
      console.log("Connected to WebSocket");
      fetchAvailableTopics();
    };

    newWs.onclose = () => {
      console.log("Disconnected from WebSocket");
    };

    newWs.onerror = (error) => {
      console.error("WebSocket error:", error);
      setErrorMessage("Failed to connect to WebSocket server.");
    };

    setWs(newWs);

    return () => {
      newWs.close();
    };
  }, []);

  const fetchAvailableTopics = async () => {
    try {
      const response = await fetch("/api/topics");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAvailableTopics(data);
    } catch (error) {
      console.error("Error fetching available topics:", error);
      setErrorMessage("Failed to fetch available topics.");
    }
  };

  const handleReplayTopic = (topicId) => {
    console.log("Replaying topic:", topicId);
    setErrorMessage("");
    if (topicId && ws) {
      ws.send(
        JSON.stringify({
          type: "replay",
          payload: { conversationId: topicId },
        }),
      );
      setConversationStarted(true);
    }
  };

  const handleFormSubmit = (payload) => {
    setErrorMessage("");
    ws.send(JSON.stringify({ type: "start", payload: payload }));
    setConversationStarted(true);
  };

  return (
    <div className="container">
      <h1 style={{ textAlign: "center" }}>Deep Conversational Research</h1>

      {!conversationStarted && (
        <Splash
          availableTopics={availableTopics}
          selectedTopicId={selectedTopicId}
          handleReplayTopic={handleReplayTopic}
        />
      )}

      {conversationStarted && ws && (
        <ConversationHandler
          ws={ws}
          setConversationStarted={setConversationStarted}
        />
      )}

      <Footer />

      <br />
      {errorMessage && (
        <div style={{ color: "red" }}>Error: {errorMessage}</div>
      )}

      <div
        className="modal fade"
        id="conversationModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="conversationModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="conversationModalLabel">
                Start New Conversation
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <ConversationForm onSubmit={handleFormSubmit} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
