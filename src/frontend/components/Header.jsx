import React from "react";
import NavigationBar from "./NavigationBar";

function Header({ onNavigate }) {
  return (
    <header className="bg-light p-3">
      <NavigationBar onNavigate={onNavigate} />
    </header>
  );
}

export default Header;
