import React, { useState } from "react";

function ResearchCard({ research, onSelect }) {
  return (
    <div className="card" style={{ maxWidth: "20em" }}>
      <div className="card-body">
        <h5 className="card-title">{research.id}</h5>
        <p className="card-text" style={{ display: "block" }}>
          {research.context}
        </p>
      </div>
      <div className="card-footer">
        <button className="btn btn-secondary" onClick={() => onSelect()}>
          View Details
        </button>
      </div>
    </div>
  );
}

export default ResearchCard;
