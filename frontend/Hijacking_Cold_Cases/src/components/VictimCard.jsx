import React, { useState } from "react";
import "./VictimCard.css"; // <-- Import custom styling here

export default function VictimCard({
  victim,
  occupation,
  causeOfDeath,
  lastKnownLocation,
  backgroundStory,
  photoUrl,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="victim-folder-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="folder-tab"
      >
        {isOpen ? "🗂 Close File" : "🗂 Open Victim File"}
      </button>

      {isOpen && (
        <div className="victim-folder-paper">
          <div className="folder-clip"></div>

          {photoUrl && (
            <img
              src={photoUrl}
              alt={victim}
              className="victim-photo"
            />
          )}
          <div className="victim-info">
            <p><strong>Name:</strong> {victim}</p>
            <p><strong>Occupation:</strong> {occupation || "Unknown"}</p>
            <p><strong>Cause of Death:</strong> {causeOfDeath || "Unknown"}</p>
            <p><strong>Last Known Location:</strong> {lastKnownLocation || "Unknown"}</p>
            <p><strong>Background Story:</strong> {backgroundStory || "None available."}</p>
          </div>
        </div>
      )}
    </div>
  );
}
