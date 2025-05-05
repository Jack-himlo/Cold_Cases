import React, { useState } from "react";
import "./EvidenceCard.css";

export default function EvidenceCard({ evidence }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!evidence) return null;

  return (
    <div className="evidence-folder">
      <button className="folder-tab" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "📂 Close File" : "📂 Evidence File"}
      </button>

      {isOpen && (
        <div className="evidence-content">
          <h3>{evidence.title}</h3>
          <p>{evidence.description}</p>
          {evidence.image_url && (
            <img
              src={evidence.image_url}
              alt={evidence.title}
              className="evidence-image"
            />
          )}
        </div>
      )}
    </div>
  );
}
