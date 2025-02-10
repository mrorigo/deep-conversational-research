const ws = new WebSocket("ws://localhost:3210/websocket");

const startConversationButton = document.getElementById(
  "startConversationButton",
);
const eventLog = document.getElementById("eventLog");
const conversationForm = document.getElementById("conversationForm");
const conversationModal = document.getElementById("conversationModal");

ws.onopen = () => {
  console.log("Connected to WebSocket");
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "log") {
    // Handle log messages
    const message = document.createElement("p");
    message.textContent = `Log: ${JSON.stringify(data.payload)}`;
    eventLog.appendChild(message);
    eventLog.scrollTop = eventLog.scrollHeight; // Auto-scroll to bottom

    if (data.payload.event === "ConversationStarted") {
      // Hide the start conversation button
      startConversationButton.style.display = "none";
      // Show the event log
      eventLog.style.display = "block";
      //Close the model
      $(conversationModal).modal("hide");
    }
  } else {
    // Handle other messages (e.g., status, error)
    const message = document.createElement("p");
    message.textContent = `Received: ${event.data}`;
    eventLog.appendChild(message);
    eventLog.scrollTop = eventLog.scrollHeight; // Auto-scroll to bottom
  }
};

ws.onclose = () => {
  console.log("Disconnected from WebSocket");
};

conversationForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const topic = document.getElementById("topic").value;
  const num_groups = parseInt(document.getElementById("num_groups").value);
  const num_agents = parseInt(document.getElementById("num_agents").value);
  const enableResearch = document.getElementById("enableResearch").checked;
  const researchDepth = parseInt(
    document.getElementById("researchDepth").value,
  );
  const researchBreadth = parseInt(
    document.getElementById("researchBreadth").value,
  );
  const models = document.getElementById("models").value.split(",");
  const rounds = parseInt(document.getElementById("rounds").value);
  const steps = parseInt(document.getElementById("steps").value);

  const payload = {
    topic: topic,
    num_groups: num_groups,
    num_agents: num_agents,
    enableResearch: enableResearch,
    researchDepth: researchDepth,
    researchBreadth: researchBreadth,
    models: models,
    rounds: rounds,
    steps: steps,
  };

  ws.send(JSON.stringify({ type: "start", payload: payload }));
});
