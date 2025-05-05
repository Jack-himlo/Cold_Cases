import React, { useState } from "react";
import "./SuspectCard.css"; // new CSS file for this style

export default function SuspectCard({ name, alibi, clueText, photoUrl, onGuess, isDisabled }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="suspect-folder-container">
      {/* Suspect Tab */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="folder-tab"
      >
        {isOpen ? `📁 Close File` : `📁 Open ${name}'s File`}
      </button>

      {/* File Contents */}
      {isOpen && (
        <div className="suspect-folder-paper">
          <div className="folder-clip"></div>

          {/* Suspect Photo */}
          {photoUrl && (
            <img
              src={photoUrl}
              alt={name}
              className="suspect-photo"
            />
          )}

          {/* Info */}
          <div className="suspect-info">
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Alibi:</strong> {alibi || "None given"}</p>
            {clueText && (
              <p><strong>Clue:</strong> {clueText}</p>
            )}
          </div>
        </div>
      )}

      {/* Guess Button */}
      <button
        onClick={() => onGuess(name)}
        disabled={isDisabled}
        className={`guess-button ${isDisabled ? "disabled" : ""}`}
      >
        Guess {name} is the Killer
      </button>
    </div>
  );
}
