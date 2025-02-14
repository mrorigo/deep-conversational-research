import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Header from "./components/Header";
import Footer from "./components/Footer";
import StartPage from "./pages/StartPage";
import ResearchPage from "./pages/ResearchPage";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  const [activeSection, setActiveSection] = useState("start");

  return (
    <div>
      <Header onNavigate={(section) => setActiveSection(section)} />
      {activeSection === "start" && <StartPage />}
      {activeSection === "research" && <ResearchPage />}
      <Footer />
    </div>
  );
}

export default App;

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
