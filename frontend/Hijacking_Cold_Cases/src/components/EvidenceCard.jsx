// src/components/EvidenceCard.jsx
import React from "react";

export default function EvidenceCard({ evidence }) {
  if (!evidence) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {evidence.title}
      </h3>
      <p className="text-gray-800 dark:text-gray-200">{evidence.description}</p>
      {evidence.image_url && (
        <img
          src={evidence.image_url}
          alt={evidence.title}
          className="mt-2 rounded max-h-48"
        />
      )}
    </div>
  );
}
