import React, { useEffect, useState } from "react";
import ResearchGallery from "../components/ResearchGallery";
import ResearchDetails from "../components/ResearchDetails";

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
  // useEffect(() => {
  //   setResearchList([
  //     { id: "research 1", title: "Research 1" },
  //     { id: "research 2", title: "Research 2" },
  //     { id: "research 3", title: "Research 3" },
  //   ]);
  // }, []);

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
          onCreateResearch={handleCreateResearch}
          onSelectResearch={handleSelectResearch}
        />
      )}
    </div>
  );
}

export default ResearchPage;
