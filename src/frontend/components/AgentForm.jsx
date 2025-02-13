import React from "react";
import { useForm } from "react-hook-form";

function AgentForm({ onSubmit, agent, onClose }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      title: agent ? agent.title : "",
      persona: agent ? agent.persona : "",
    },
  });

  const clearForm = () => {
    reset({ title: "", persona: "" });
  };

  const onSubmitHandler = (data) => {
    onSubmit(data);
    clearForm();
    onClose();
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            className="form-control"
            id="title"
            {...register("title", {
              required: "Title is required",
              minLength: {
                value: 3,
                message: "Title must be at least 3 characters",
              },
            })}
          />
          {errors.title && (
            <p className="text-danger">{errors.title.message}</p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="persona">
            Persona <small>(You are..)</small>
          </label>
          <textarea
            className="form-control"
            id="persona"
            {...register("persona")}
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary">
          Save
        </button>
      </form>
    </div>
  );
}

export default AgentForm;
