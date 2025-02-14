import React, { useEffect, useState } from "react";
import { marked } from "marked";

function GroupConversations({ eventLog, numGroups }) {
  const [activeGroupTab, setActiveGroupTab] = useState(0);

  if (numGroups <= 0) {
    return <div>No groups available</div>;
  }

  // Create an array to store the conversation for each group
  const conversations = Array.from({ length: numGroups }, () => []);

  // Filter the event log to extract the messages for each group
  eventLog.forEach((event) => {
    if (event.type === "log" && event.payload.event === "MessageSent") {
      const groupId = event.payload.group; // Assuming the group ID is available in the event payload
      if (groupId !== undefined && groupId >= 0 && groupId < numGroups) {
        conversations[groupId].push(event.payload); // Store the entire payload
      }
    }
    if (event.type === "log" && event.payload.event === "InsightsShared") {
      const groupId = event.payload.toGroup;
      if (groupId !== undefined && groupId >= 0 && groupId < numGroups) {
        conversations[groupId].push({
          agent: "Insights shared from group " + event.payload.fromGroup,
          message: event.payload.summary,
        });
      }
    }
  });

  const renderMarkdown = (markdown) => {
    return { __html: marked(markdown, { sanitize: true }) };
  };

  const styles = {
    navTab: {
      color: "#89cff0",
      backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
    navTabActive: {
      color: "#fff",
      backgroundColor: "rgba(137, 207, 240, 0.2)",
      borderColor: "#89cff0",
    },
    conversationContainer: {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(137, 207, 240, 0.3)",
      borderRadius: "8px",
      color: "#ecf0f1",
    },
  };

  return (
    <div>
      <ul className="nav nav-tabs">
        {Array.from({ length: numGroups }).map((_, index) => (
          <li className="nav-item" key={index}>
            <a
              className={`nav-link ${activeGroupTab === index ? "active" : ""}`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveGroupTab(index);
              }}
              style={
                activeGroupTab === index ? styles.navTabActive : styles.navTab
              }
            >
              Group {index + 1}
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-3">
        <div className="border p-2" style={styles.conversationContainer}>
          {conversations[activeGroupTab].map((message, messageIndex) => (
            <div key={messageIndex}>
              <strong>{message.agent}:</strong>
              <div dangerouslySetInnerHTML={renderMarkdown(message.message)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GroupConversations;