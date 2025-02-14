import React, { useState } from "react";

function ResearchCard({ research, onSelect }) {
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">{atob(research.id.split("-")[1])}</h5>
        <p className="card-text">{research.topic}</p>
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
