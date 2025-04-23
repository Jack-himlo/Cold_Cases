import React, { useState } from "react";

export default function SuspectCard({ name, alibi, clueText, photoUrl }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen((prev) => !prev);

  return (
    <div className="bg-white p-4 rounded shadow hover:shadow-lg transition duration-200">
      <h3 className="font-bold text-lg">{name}</h3>

      <button
        onClick={handleToggle}
        className="mt-2 px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
      >
        {isOpen ? "Close File" : "Open File"}
      </button>

      {isOpen && (
        <div className="mt-4">
          {photoUrl && (
            <img
              src={photoUrl}
              alt={`${name}'s profile`}
              className="w-24 h-24 object-cover rounded-full mx-auto mb-2"
            />
          )}
          <p className="text-sm mt-2">
            <strong>Alibi:</strong> {alibi}
          </p>
          <p className="text-sm text-gray-800 mt-2">
            <strong>Clue:</strong> {clueText || "No Clue Assigned"}
          </p>
        </div>
      )}
    </div>
  );
}
