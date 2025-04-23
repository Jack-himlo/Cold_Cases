import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../api/axiosInstance";
import React from "react";
import VictimCard from "../components/VictimCard";
import SuspectCard from "../components/SuspectCard";

export default function CaseInvestigation() {
  const { id: caseId } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [people, setPeople] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [caseRes, peopleRes] = await Promise.all([
          axios.get(`/cases/${caseId}/`),
          axios.get("/people/"),
        ]);
        setCaseData(caseRes.data);
        setPeople(peopleRes.data);
      } catch (err) {
        console.error("Error loading case or people:", err);
      }
    };

    fetchData();
  }, [caseId]);

  if (!caseData) return <p>Loading case...</p>;

  return (
    <div className="p-6">
      {/* Case Title */}
      <h1 className="text-2xl font-bold">{caseData.title}</h1>

      {/* Case Summary */}
      <p className="italic text-gray-600 mb-4">{caseData.summary}</p>

      {/* Victim Card */}
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

          const person = people.find(
            (p) =>
              `${p.first_name} ${p.last_name}`.toLowerCase() === name.toLowerCase()
          );

          return (
            <SuspectCard
              key={name}
              name={name}
              alibi={alibi}
              clueText={clueObj?.text}
              photoUrl={person?.picture || person?.thumbnail_picture}
            />
          );
        })}
      </div>
    </div>
  );
}
