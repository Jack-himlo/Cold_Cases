import React, { useState } from "react";


export default function VictimCard({ victim, occupation, causeOfDeath, lastKnownLocation, backgroundStory }) {
    const [isOpen, setIsOpen] = useState(false);
  
    return (
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Victim:</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-gray-200 rounded mb-2"
        >
          {isOpen ? "Close File" : "Open File"}
        </button>
  
        {isOpen && (
          <div className="bg-white p-4 border rounded shadow">
            <p><strong>Name:</strong> {victim || "Unknown"}</p>
            <p><strong>Occupation:</strong> {occupation || "Unknown"}</p>
            <p><strong>Cause of Death:</strong> {causeOfDeath || "Unknown"}</p>
            <p><strong>Last Known Location:</strong> {lastKnownLocation || "Unknown"}</p>
            <p><strong>Background Story:</strong> {backgroundStory || "None available."}</p>
          </div>
        )}
      </div>
    );
  }
  