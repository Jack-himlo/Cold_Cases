import React, { useState } from "react";


export default function VictimCard({ victim }) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    first_name,
    last_name,
    occupation,
    cause_of_death,
    last_known_location,
    background_story,
    picture,
  } = victim || {};

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
        <div className="bg-white p-4 border rounded shadow space-y-2">
          {picture && (
            <img
              src={picture}
              alt={`${first_name} ${last_name}`}
              className="rounded shadow max-h-48 mx-auto"
            />
          )}
          <p><strong>Name:</strong> {first_name} {last_name}</p>
          <p><strong>Occupation:</strong> {occupation || "Unknown"}</p>
          <p><strong>Cause of Death:</strong> {cause_of_death || "Unknown"}</p>
          <p><strong>Last Known Location:</strong> {last_known_location || "Unknown"}</p>
          <p><strong>Background Story:</strong> {background_story || "None available."}</p>
        </div>
      )}
    </div>
  );
}
