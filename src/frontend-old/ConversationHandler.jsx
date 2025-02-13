import React, { useState, useEffect } from "react";
import EventLog from "./EventLog";
import Overview from "./Overview";
import GroupConversations from "./GroupConversations";
import FinalReports from "./FinalReports";

function ConversationHandler({ ws, setConversationStarted }) {
  const [topic, setTopic] = useState("");
  const [numGroups, setNumGroups] = useState(0);
  const [numAgents, setNumAgents] = useState(0);
  const [enableResearch, setEnableResearch] = useState(false);
  const [researchDepth, setResearchDepth] = useState(0);
  const [researchBreadth, setResearchBreadth] = useState(0);
  const [models, setModels] = useState("");
  const [rounds, setRounds] = useState(0);
  const [steps, setSteps] = useState(0);
  const [eventLog, setEventLog] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [finalReport, setFinalReport] = useState(null);
  const [revisedReport, setRevisedReport] = useState(null);
  const [reportsAvailable, setReportsAvailable] = useState(false);
  const [sharedInsights, setSharedInsights] = useState([]);

  useEffect(() => {
    const messageListener = (event) => {
      const data = JSON.parse(event.data);
      setEventLog((prevEventLog) => [...prevEventLog, data]);

      if (data.type === "log") {
        if (data.payload.event === "NewResearchConversation") {
          setNumAgents(data.payload.options.agents);
          setNumGroups(data.payload.options.groups);
          setEnableResearch(data.payload.options.enableResearch);
          setResearchDepth(data.payload.options.researchDepth);
          setResearchBreadth(data.payload.options.researchBreadth);
          setModels(data.payload.options.models.join(", "));
          setRounds(data.payload.options.rounds);
          setSteps(data.payload.options.steps);
          setTopic(data.payload.options.text);
        } else if (data.payload.event === "FinalReports") {
          setFinalReport(data.payload.report);
          setRevisedReport(data.payload.revisedReport);
          setReportsAvailable(true);
        } else if (data.payload.event === "AllSharedInsights") {
          setSharedInsights(data.payload.insights);
        }
      }
    };

    ws.addEventListener("message", messageListener);

    return () => {
      ws.removeEventListener("message", messageListener);
    };
  }, [ws]);

  const handleCloseConversation = () => {
    setTopic("");
    setNumGroups(0);
    setNumAgents(0);
    setEnableResearch(false);
    setResearchDepth(0);
    setResearchBreadth(0);
    setModels("");
    setRounds(0);
    setSteps(0);
    setEventLog([]);
    setActiveTab("overview");
    setFinalReport(null);
    setRevisedReport(null);
    setReportsAvailable(false);
    setSharedInsights([]);
    setConversationStarted(false);
  };

  return (
    <div>
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
            href="#"
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === "eventLog" ? "active" : ""}`}
            href="#"
            onClick={() => setActiveTab("eventLog")}
          >
            Event Log
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === "groupConversations" ? "active" : ""}`}
            href="#"
            onClick={() => setActiveTab("groupConversations")}
          >
            Group Conversations
          </a>
        </li>
        {reportsAvailable && (
          <li className="nav-item">
            <a
              className={`nav-link ${activeTab === "finalReports" ? "active" : ""}`}
              href="#"
              onClick={() => setActiveTab("finalReports")}
            >
              Final Reports
            </a>
          </li>
        )}
        <li className="nav-item" style={{ marginLeft: "auto" }}>
          <a className="nav-link" href="#" onClick={handleCloseConversation}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-x"
              viewBox="0 0 16 16"
            >
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
            </svg>
          </a>
        </li>
      </ul>

      <div className="mt-3">
        {activeTab === "overview" && (
          <Overview
            topic={topic}
            numAgents={numAgents}
            numGroups={numGroups}
            rounds={rounds}
            steps={steps}
            researchDepth={researchDepth}
            researchBreadth={researchBreadth}
            models={models}
            report={finalReport}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === "eventLog" && <EventLog eventLog={eventLog} />}
        {activeTab === "groupConversations" && (
          <GroupConversations eventLog={eventLog} numGroups={numGroups} />
        )}
        {activeTab === "finalReports" && reportsAvailable && (
          <FinalReports
            report={finalReport}
            revisedReport={revisedReport}
            sharedInsights={sharedInsights}
          />
        )}
      </div>
    </div>
  );
}

export default ConversationHandler;
