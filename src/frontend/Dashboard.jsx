import React from "react";

function Dashboard({
  topic,
  numAgents,
  numGroups,
  rounds,
  steps,
  researchDepth,
  researchBreadth,
  models,
  report,
  setActiveTab,
}) {
  return (
    <div className="card mt-3">
      <div className="card-header">Dashboard</div>
      <div className="card-body">
        <p>
          <strong>Topic:</strong> {topic}
        </p>
        <p>
          <strong>Number of Agents:</strong> {numAgents}
        </p>
        <p>
          <strong>Number of Groups:</strong> {numGroups}
        </p>
        <p>
          <strong>Number of Rounds:</strong> {rounds}
        </p>
        <p>
          <strong>Steps per Round:</strong> {steps}
        </p>
        <p>
          <strong>Research Depth:</strong> {researchDepth}
        </p>
        <p>
          <strong>Research Breadth:</strong> {researchBreadth}
        </p>
        <p>
          <strong>Models:</strong> {models}
        </p>
        {report && (
          <div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault(); // Prevent the default link behavior
                setActiveTab("finalReports");
              }}
            >
              View Final Reports
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
