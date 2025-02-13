import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PersonaGallery from "./components/PersonaGallery";
import StartPage from "./pages/StartPage";
import PersonasPage from "./pages/PersonasPage";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  const [activeSection, setActiveSection] = useState("start");

  console.log("activeSection", activeSection);
  return (
    <div>
      <Header onNavigate={(section) => setActiveSection(section)} />
      {activeSection === "start" && <StartPage />}
      {activeSection === "personas" && <PersonasPage />}
      <Footer />
    </div>
  );
}

export default App;

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
