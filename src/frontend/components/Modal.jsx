import React, { useEffect } from "react";
import ReactModal from "react-modal";

function Modal({ isOpen, onClose, children, title }) {
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#fff",
      padding: "20px",
      borderRadius: "5px",
      boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
      width: "500px",
      maxWidth: "90%",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 1000,
    },
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel={title}
    >
      <h2>{title}</h2>
      {children}
      <button className="btn btn-secondary" onClick={onClose}>
        Close
      </button>
    </ReactModal>
  );
}

export default Modal;
