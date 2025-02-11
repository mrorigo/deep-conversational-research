import React, { useEffect } from "react";
import { marked } from "marked";

function GroupConversations({ eventLog, numGroups }) {
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

  return (
    <div>
      {conversations.map((groupConversation, index) => (
        <div key={index} className="mb-3">
          <h4>Group {index + 1}</h4>
          <div className="border p-2">
            {groupConversation.map((message, messageIndex) => (
              <div key={messageIndex}>
                <strong>{message.agent}:</strong>
                <div
                  dangerouslySetInnerHTML={renderMarkdown(message.message)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default GroupConversations;
