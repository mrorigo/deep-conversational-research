import React from "react";

function Button({ children, onClick }) {
  return (
    <button className="btn btn-primary" onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
