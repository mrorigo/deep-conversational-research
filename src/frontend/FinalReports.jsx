import React, { useState, useEffect } from "react";
import { marked } from "marked";

function FinalReports({ report, revisedReport }) {
  const [activeReportTab, setActiveReportTab] = useState("report"); // Default to 'report' tab
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    // Initialize Marked.js (if necessary) - Marked should now be available globally.
    // No initialization needed if using the CDN version and accessing 'marked' directly.
  }, []);

  const renderMarkdown = (markdown) => {
    return { __html: marked(markdown, { sanitize: true }) };
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage("Copied!");
      setTimeout(() => setCopyMessage(""), 2000); // Clear message after 2 seconds
    } catch (err) {
      console.error("Failed to copy: ", err);
      setCopyMessage("Copy failed!");
      setTimeout(() => setCopyMessage(""), 2000);
    }
  };

  return (
    <div className="container mt-3">
      <h2>Final Reports</h2>

      <ul className="nav nav-tabs">
        <li className="nav-item">
          <a
            className={`nav-link ${activeReportTab === "report" ? "active" : ""}`}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveReportTab("report");
            }}
          >
            Report
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${activeReportTab === "revisedReport" ? "active" : ""}`}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveReportTab("revisedReport");
            }}
          >
            Revised Report
          </a>
        </li>
      </ul>

      <div className="mt-3">
        {copyMessage && (
          <div className="alert alert-success">{copyMessage}</div>
        )}

        {activeReportTab === "report" && report && (
          <div>
            <h3>
              Report
              <button
                className="btn btn-sm btn-outline-secondary float-right"
                onClick={() => copyToClipboard(report)}
              >
                Copy
              </button>
            </h3>
            <div
              className="border p-3"
              style={{ backgroundColor: "#f8f9fa" }}
              dangerouslySetInnerHTML={renderMarkdown(report)}
            />
          </div>
        )}

        {activeReportTab === "revisedReport" && revisedReport && (
          <div>
            <h3>
              Revised Report
              <button
                className="btn btn-sm btn-outline-secondary float-right"
                onClick={() => copyToClipboard(revisedReport)}
              >
                Copy
              </button>
            </h3>
            <div
              className="border p-3"
              style={{ backgroundColor: "#e9ecef" }}
              dangerouslySetInnerHTML={renderMarkdown(revisedReport)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FinalReports;
