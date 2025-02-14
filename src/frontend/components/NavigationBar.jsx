import React from "react";

function NavigationBar({ onNavigate }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <a className="navbar-brand" href="#">
        Home
      </a>
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav">
          <li className="nav-item active">
            <a
              className="nav-link"
              href="#"
              onClick={() => onNavigate("start")}
            >
              Start
            </a>
          </li>
          <li className="nav-item active">
            <a
              className="nav-link"
              href="#"
              onClick={() => onNavigate("research")}
            >
              Research
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default NavigationBar;
