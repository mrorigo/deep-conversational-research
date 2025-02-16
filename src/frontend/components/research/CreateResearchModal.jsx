import React from "react";
import CreateResearchForm from "./CreateResearchForm";

function CreateResearchModal({ onSubmit }) {
  const handleSubmit = (values) => {
    window.$("#researchModal").modal("hide");
    onSubmit(values);
  };

  return (
    <div
      className="modal fade"
      id="researchModal"
      tabIndex="-1"
      role="dialog"
      aria-labelledby="researchModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="researchModalLabel">
              Start New Research
            </h5>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <CreateResearchForm onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateResearchModal;
