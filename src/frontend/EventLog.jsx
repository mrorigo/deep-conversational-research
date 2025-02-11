import React, { useRef, useEffect, useState } from "react";

function EventLog({ eventLog, conversationStarted }) {
  const eventLogRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEvents, setExpandedEvents] = useState({});

  useEffect(() => {
    if (eventLogRef.current) {
      eventLogRef.current.scrollTop = eventLogRef.current.scrollHeight;
    }
  }, [eventLog]);

  const filteredEventLog = eventLog.filter((event) => {
    if (!event.payload) return false; // Skip events without payload
    const eventString = JSON.stringify(event.payload).toLowerCase();
    return eventString.includes(searchTerm.toLowerCase());
  });

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const toggleEventDetails = (index) => {
    setExpandedEvents((prevExpandedEvents) => ({
      ...prevExpandedEvents,
      [index]: !prevExpandedEvents[index],
    }));
  };

  const getEventTitle = (payload) => {
    let title = `${formatTime(payload.timestamp)} - ${payload.event}`;

    if (payload.group !== undefined) {
      title += ` - Group: ${payload.group}`;
    }
    if (payload.agent !== undefined) {
      title += ` - Agent: ${payload.agent}`;
    }
    if (payload.roundNumber !== undefined) {
      title += ` - Round: ${payload.roundNumber}`;
    }
    if (payload.stepNumber !== undefined) {
      title += ` - Step: ${payload.stepNumber}`;
    }

    return title;
  };

  return (
    <div
      id="eventLogContainer"
      style={{ display: conversationStarted ? "block" : "none" }}
    >
      <div className="mb-2">
        <input
          type="text"
          className="form-control"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div
        id="eventLog"
        className="border p-3 mt-3"
        style={{ height: "500px", overflowY: "scroll" }}
        ref={eventLogRef}
      >
        {filteredEventLog.map((event, index) => {
          console.log(event, event);
          if (event.payload.type === "status" && event.payload.message) {
            return (
              <div
                key={index}
                className="mb-2 border-bottom pb-2 bg-success text-white"
              >
                <div className="d-flex justify-content-center align-items-center">
                  <span title="Event Info" className="font-weight-bold">
                    {event.payload.message}
                  </span>
                </div>
              </div>
            );
          }

          const { payload } = event;
          const isExpanded = expandedEvents[index] || false;
          const eventTitle = getEventTitle(payload);

          return (
            <div key={index} className="mb-2 border-bottom pb-2">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <span title="Event Info" className="font-weight-bold">
                    {eventTitle}
                  </span>
                </div>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => toggleEventDetails(index)}
                >
                  {isExpanded ? "Hide Details" : "Show Details"}
                </button>
              </div>

              {isExpanded && (
                <div className="mt-2">
                  {payload.event === "ResearchEvent" && (
                    <>
                      <p>
                        <strong>Query:</strong> {payload.query}
                      </p>
                      {payload.learnings && (
                        <>
                          <strong>Learnings:</strong>
                          <ul>
                            {payload.learnings.map((learning, i) => (
                              <li key={i}>{learning}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      {payload.urls && (
                        <>
                          <strong>URLs:</strong>
                          <ul>
                            {payload.urls.map((url, i) => (
                              <li key={i}>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {url}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </>
                  )}
                  {payload.event === "MessageSent" && (
                    <>
                      <p>
                        <strong>Message:</strong> {payload.message}
                      </p>
                    </>
                  )}
                  {payload.event === "ConversationStarted" && (
                    <>
                      <p>
                        <strong>Topic:</strong> {payload.topic}
                      </p>
                      <p>
                        <strong>Agents:</strong> {payload.agents.join(", ")}
                      </p>
                    </>
                  )}
                  {payload.event === "RoundStarted" && (
                    <>
                      <p>
                        <strong>Topic:</strong> {payload.topic}
                      </p>
                    </>
                  )}
                  {payload.event === "StepStarted" && <></>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EventLog;
