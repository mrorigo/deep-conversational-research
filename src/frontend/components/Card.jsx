import React from "react";

function Card({ title, image, children }) {
  return (
    <div className="card">
      {image && <img src={image} className="card-img-top" alt="Card" />}
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <div className="card-text">{children}</div>
      </div>
    </div>
  );
}

export default Card;
