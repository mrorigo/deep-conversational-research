import React, { useState, useEffect } from "react";
import { marked } from "marked";

function FinalReports({ report, revisedReport, sharedInsights }) {
  const [activeReportTab, setActiveReportTab] = useState("report");
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {}, []);

  const renderMarkdown = (markdown) => {
    return { __html: marked(markdown, { sanitize: true }) };
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage("Copied!");
      setTimeout(() => setCopyMessage(""), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      setCopyMessage("Copy failed!");
      setTimeout(() => setCopyMessage(""), 2000);
    }
  };

  // Custom styles for the dark theme
  const styles = {
    navTab: {
      color: "#89cff0",
      backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
    navTabActive: {
      color: "#fff",
      backgroundColor: "rgba(137, 207, 240, 0.2)",
      borderColor: "#89cff0",
    },
    reportContainer: {
      backgroundColor: "rgba(255, 255, 255, 0.03)",
      border: "1px solid rgba(137, 207, 240, 0.2)",
      borderRadius: "8px",
      color: "#ecf0f1",
    },
    revisedReportContainer: {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(137, 207, 240, 0.3)",
      borderRadius: "8px",
      color: "#ecf0f1",
    },
    sharedInsightsContainer: {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(137, 207, 240, 0.3)",
      borderRadius: "8px",
      color: "#ecf0f1",
    },
    copyButton: {
      color: "#89cff0",
      borderColor: "#89cff0",
      backgroundColor: "transparent",
    },
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
            style={
              activeReportTab === "report" ? styles.navTabActive : styles.navTab
            }
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
            style={
              activeReportTab === "revisedReport"
                ? styles.navTabActive
                : styles.navTab
            }
          >
            Revised Report
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${activeReportTab === "sharedInsights" ? "active" : ""}`}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveReportTab("sharedInsights");
            }}
            style={
              activeReportTab === "sharedInsights"
                ? styles.navTabActive
                : styles.navTab
            }
          >
            Shared Insights
          </a>
        </li>
      </ul>

      <div className="mt-3">
        {copyMessage && (
          <div
            className="alert alert-success"
            style={{
              backgroundColor: "rgba(40, 167, 69, 0.2)",
              borderColor: "#28a745",
              color: "#fff",
            }}
          >
            {copyMessage}
          </div>
        )}

        {activeReportTab === "report" && report && (
          <div>
            <h3>
              Report
              <button
                className="btn btn-sm btn-outline-secondary float-right"
                onClick={() => copyToClipboard(report)}
                style={styles.copyButton}
              >
                Copy
              </button>
            </h3>
            <div
              className="p-3"
              style={styles.reportContainer}
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
                style={styles.copyButton}
              >
                Copy
              </button>
            </h3>
            <div
              className="p-3"
              style={styles.revisedReportContainer}
              dangerouslySetInnerHTML={renderMarkdown(revisedReport)}
            />
          </div>
        )}

        {activeReportTab === "sharedInsights" && sharedInsights && (
          <div>
            <h3>Shared Insights</h3>
            <div className="p-3" style={styles.sharedInsightsContainer}>
              <ul>
                {sharedInsights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FinalReports;
