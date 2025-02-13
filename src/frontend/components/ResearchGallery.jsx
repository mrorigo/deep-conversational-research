import React, { useState } from "react";

function ResearchGallery({ research }) {
  return (
    <div className="d-flex flex-wrap">
      {research.map((researchItem) => (
        <div key={researchItem.id} className="p-2">
          <h3>{researchItem.title}</h3>
          <p>{researchItem.description}</p>
        </div>
      ))}
    </div>
  );
}

export default ResearchGallery;
