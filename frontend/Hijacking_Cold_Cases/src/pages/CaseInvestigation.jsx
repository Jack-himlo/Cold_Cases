import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../api/axiosInstance";
import React from "react";
import VictimCard from "../components/VictimCard";

export default function CaseInvestigation() {
  const { id: caseId } = useParams(); // Get ID from URL
  const [caseData, setCaseData] = useState(null);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const response = await axios.get(`/cases/${caseId}/`);
        setCaseData(response.data);
      } catch (err) {
        console.error("Error loading case:", err);
      }
    };

    fetchCase();
  }, [caseId]);

  if (!caseData) return <p>Loading case...</p>;

  return (
    <div className="p-6">
      {/* Case Title */}
      <h1 className="text-2xl font-bold">{caseData.title}</h1>

      {/* Case Summary */}
      <p className="italic text-gray-600 mb-4">{caseData.summary}</p>

      <VictimCard
        victim={caseData.victim_name}
        occupation={caseData.victim_occupation}
        causeOfDeath={caseData.cause_of_death}
        lastKnownLocation={caseData.last_known_location}
        backgroundStory={caseData.background_story}
        />

      {/* Back Link */}
      <Link to="/cases" className="text-blue-600 underline mb-4 inline-block">
        ← Back to case list
      </Link>

      {/* Character Alibis & Clues */}
      <h2 className="text-xl font-semibold mt-6">Character Files</h2>
      <div className="grid gap-4 mt-2 sm:grid-cols-2 md:grid-cols-3">
        {Object.entries(caseData.alibis || {}).map(([name, alibi]) => {
          const clueObj = caseData.clues?.find(
            (clue) => clue.character?.toLowerCase() === name.toLowerCase()
          );

          return (
            <div
              key={name}
              className="bg-white p-4 rounded shadow hover:shadow-lg transition duration-200"
            >
              <h3 className="font-bold text-lg">{name}</h3>
              <p className="text-sm mt-1">{alibi}</p>
              <p className="text-sm text-gray-800 mt-2">
                <span className="font-semibold">Clue:</span>{" "}
                {clueObj ? clueObj.text : "No Clue Assigned"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
