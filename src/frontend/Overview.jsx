import React from "react";

function Overview({
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
    <div className="card mt-3 overview-card">
      <div className="card-header">{topic}</div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <p>
              <strong>Number of Agents:</strong> {numAgents}
            </p>
            <p>
              <strong>Number of Groups:</strong> {numGroups}
            </p>
            <p>
              <strong>Number of Rounds:</strong> {rounds}
            </p>
          </div>
          <div className="col-md-6">
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
          </div>
        </div>
        {report && (
          <div>
            <button
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault(); // Prevent the default link behavior
                setActiveTab("finalReports");
              }}
            >
              View Final Reports and Insights
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Overview;
