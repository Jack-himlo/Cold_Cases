import React, { useState } from "react";

export default function SuspectCard({ suspect, onGuess, isDisabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    name,
    alibi,
    clueText,
    photoUrl,
  } = suspect || {};

  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-md">
      {photoUrl && (
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-40 object-cover rounded-lg mb-3"
        />
      )}

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-900 text-white py-1 px-3 mt-2 rounded hover:bg-gray-700"
      >
        {isOpen ? "Close File" : "Open File"}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2">
          <p><strong>Alibi:</strong> {alibi}</p>
          {clueText && (
            <p><strong>Clue:</strong> {clueText}</p>
          )}
        </div>
      )}

      <button
        onClick={() => onGuess(name)}
        disabled={isDisabled}
        className={`mt-4 w-full py-2 rounded transition ${
          isDisabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-500 text-white"
        }`}
      >
        Guess {name} is the Killer
      </button>
    </div>
  );
}
