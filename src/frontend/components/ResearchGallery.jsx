import React, { useState } from "react";
import ResearchCard from "./ResearchCard";

function ResearchGallery({ researchList, onCreateResearch, onSelectResearch }) {
  return (
    <div>
      <div className="d-flex flex-wrap">
        {researchList.map((researchItem) => (
          <ResearchCard
            key={researchItem.id}
            onSelect={() => onSelectResearch(researchItem.id)}
            research={researchItem}
          />
        ))}
        <div
          className="card"
          style={{ width: "18rem", cursor: "pointer" }}
          onClick={() => onCreateResearch({ title: "New Research" })}
        >
          <div className="card-body d-flex justify-content-center align-items-center">
            <h1 style={{ fontSize: "5rem", color: "grey" }}>+</h1>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResearchGallery;
