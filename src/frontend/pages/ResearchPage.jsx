import React, { useEffect, useState } from "react";
import ResearchGallery from "../components/research/ResearchGallery";
import ResearchDetails from "../components/research/ResearchDetails";
import CreateResearchForm from "../components/research/CreateResearchForm";
import CreateResearchModal from "../components/research/CreateResearchModal";

function ResearchPage() {
  const [researchList, setResearchList] = useState([]);
  // const [conversationStarted, setConversationStarted] = useState(false);
  const [currentResearchId, setCurrentResearchId] = useState(null);
  const [ws, setWs] = useState(null);

  const fetchAvailableTopics = async () => {
    try {
      const response = await fetch("/api/topics");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setResearchList(data);
    } catch (error) {
      console.error("Error fetching available topics:", error);
      setErrorMessage("Failed to fetch available topics.");
    }
  };

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
    };

    setWs(newWs);

    return () => {
      newWs.close();
    };
  }, []);

  if (!ws) {
    return <div>Connecting to WebSocket...</div>;
  }

  const openCreateResearchModal = () => {
    console.log("Opening create research modal");
    window.$("#researchModal").modal("show");
  };

  const handleCloseResearch = () => {
    setCurrentResearchId(null);
  };

  const handleSelectResearch = (researchId) => {
    console.log("Replaying research:", researchId);
    if (ws) {
      ws.send(
        JSON.stringify({
          type: "replay",
          payload: { conversationId: researchId },
        }),
      );
      setCurrentResearchId(researchId);
    } else {
      console.error("WebSocket not connected");
    }
  };

  const handleCreateResearch = (newResearch) => {
    if (ws) {
      ws.send(
        JSON.stringify({
          type: "start",
          payload: newResearch,
        }),
      );
    } else {
      console.error("WebSocket not connected");
    }
  };

  return (
    <div>
      {currentResearchId && (
        <ResearchDetails
          onCloseResearch={handleCloseResearch}
          researchId={currentResearchId}
          ws={ws}
        />
      )}
      {!currentResearchId && (
        <ResearchGallery
          researchList={researchList}
          onCreateResearch={openCreateResearchModal}
          onSelectResearch={handleSelectResearch}
        />
      )}
      <CreateResearchModal onSubmit={handleCreateResearch} />
    </div>
  );
}

export default ResearchPage;
