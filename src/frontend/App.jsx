import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import ConversationForm from "./ConversationForm";
import EventLog from "./EventLog";
import Overview from "./Overview";
import GroupConversations from "./GroupConversations";
import FinalReports from "./FinalReports";
import Footer from "./Footer";

function App() {
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
  const [ws, setWs] = useState(null);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [finalReport, setFinalReport] = useState(null);
  const [revisedReport, setRevisedReport] = useState(null);
  const [reportsAvailable, setReportsAvailable] = useState(false);
  const [sharedInsights, setSharedInsights] = useState([]);

  useEffect(() => {
    const newWs = new WebSocket("ws://localhost:3210/websocket");

    newWs.onopen = () => {
      console.log("Connected to WebSocket");
    };

    newWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setEventLog((prevEventLog) => [...prevEventLog, data]);

      if (
        data.type === "log" &&
        data.payload.event === "NewResearchConversation"
      ) {
        setConversationStarted(true);
        const { options } = data.payload;
        setTopic(options.text);
        setNumGroups(options.groups);
        setNumAgents(options.agents);
        setEnableResearch(options.enableResearch);
        setResearchDepth(options.researchDepth);
        setResearchBreadth(options.researchBreadth);
        setModels(options.models.join(", "));
        setRounds(options.rounds);
        setSteps(options.steps);
      }

      if (data.type === "log" && data.payload.event === "FinalReports") {
        setFinalReport(data.payload.report);
        setRevisedReport(data.payload.revisedReport);
        setReportsAvailable(true);
      }

      if (data.type === "log" && data.payload.event === "AllSharedInsights") {
        setSharedInsights(data.payload.insights);
      }
    };

    newWs.onclose = () => {
      console.log("Disconnected from WebSocket");
    };

    setWs(newWs);

    return () => {
      newWs.close();
    };
  }, []);

  const handleFormSubmit = (payload) => {
    ws.send(JSON.stringify({ type: "start", payload: payload }));
  };

  return (
    <div className="container">
      <h1 style={{ textAlign: "center" }}>Deep Conversational Research</h1>

      <button
        type="button"
        className="btn btn-primary"
        data-toggle="modal"
        data-target="#conversationModal"
      >
        Start New Swarm Conversation Research
      </button>

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
              <ConversationForm
                onSubmit={handleFormSubmit}
                topic={topic}
                setTopic={setTopic}
                numGroups={numGroups}
                setNumGroups={setNumGroups}
                numAgents={numAgents}
                setNumAgents={setNumAgents}
                enableResearch={enableResearch}
                setEnableResearch={setEnableResearch}
                researchDepth={researchDepth}
                setResearchDepth={setResearchDepth}
                researchBreadth={researchBreadth}
                setResearchBreadth={setResearchBreadth}
                models={models}
                setModels={setModels}
                rounds={rounds}
                setRounds={setRounds}
                steps={steps}
                setSteps={setSteps}
              />
            </div>
          </div>
        </div>
      </div>

      {conversationStarted && (
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
            {activeTab === "eventLog" && (
              <EventLog
                eventLog={eventLog}
                conversationStarted={conversationStarted}
              />
            )}
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
      )}
      <Footer />
    </div>
  );
}

export default App;

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
