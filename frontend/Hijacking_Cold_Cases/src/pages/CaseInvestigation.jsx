import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../api/axiosInstance";
import React from "react";
import VictimCard from "../components/VictimCard";
import SuspectCard from "../components/SuspectCard";
import EvidenceCard from "../components/EvidenceCard";

export default function CaseInvestigation() {
  const { id: caseId } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [people, setPeople] = useState([]);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [livesRemaining, setLivesRemaining] = useState(null);
  const [caseStatus, setCaseStatus] = useState("active");

  // Submit a killer guess
  const handleGuessKiller = async (guessedName) => {
    try {
      const response = await axios.post(`/cases/${caseId}/guess/`, {
        guess: guessedName,
      });

      const data = response.data;

      if (data.result === "correct") {
        alert("Correct! You solved the case!");
      } else {
        alert(`${data.message}`);
      }

      // Re-fetch instance status after guess
      const instanceRes = await axios.get("/active-case/");
      if (instanceRes.data.case_id === parseInt(caseId)) {
        setLivesRemaining(instanceRes.data.lives_remaining);
        setCaseStatus(instanceRes.data.status || "active");
      } else {
        setCaseStatus("inactive");
      }
    } catch (err) {
      console.error("Error guessing killer:", err);
      alert("There was a problem submitting your guess.");
    }
  };

  // Load case data and status
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [caseRes, peopleRes] = await Promise.all([
          axios.get(`/cases/${caseId}/`),
          axios.get("/people/"),
        ]);
        setCaseData(caseRes.data);
        setPeople(peopleRes.data);

        const instanceRes = await axios.get("/active-case/");
        console.log("Instance data:", instanceRes.data);

        if (instanceRes.data.case_id === parseInt(caseId)) {
          setLivesRemaining(instanceRes.data.lives_remaining);
          setCaseStatus(instanceRes.data.status || "active");
        } else {
          setCaseStatus("inactive");
        }
      } catch (err) {
        console.error("Error loading case or people:", err);
      }
    };

    fetchData();
  }, [caseId]);

  if (!caseData) return <p>Loading case...</p>;

  return (
    <div className="p-6">
      {/* Title */}
      <h1 className="text-2xl font-bold">{caseData.title}</h1>

      {/* Status banner */}
      {caseStatus === "solved" && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded shadow">
          ✅ You already solved this case. No further action needed.
        </div>
      )}
      {caseStatus === "failed" && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded shadow">
          ❌ You failed this case. Better luck next time.
        </div>
      )}
      {caseStatus === "inactive" && (
        <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded shadow">
          ⚠️ You forfeited this case.
        </div>
      )}

      {/* Lives Remaining */}
      {livesRemaining !== null && caseStatus === "active" && (
        <p className="mb-2 text-sm text-gray-600">
          <strong>Lives Remaining:</strong> {livesRemaining}
        </p>
      )}

      {/* Summary */}
      <p className="italic text-gray-600 mb-4">{caseData.summary}</p>

      {/* Victim */}
      <VictimCard
        victim={caseData.victim_name}
        occupation={caseData.victim_occupation}
        causeOfDeath={caseData.cause_of_death}
        lastKnownLocation={caseData.last_known_location}
        backgroundStory={caseData.background_story}
        photoUrl={caseData.victim?.picture || caseData.victim?.thumbnail_picture}
      />

      {/* Suspects */}
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
              onGuess={handleGuessKiller}
              isDisabled={caseStatus !== "active"}
            />
          );
        })}
      </div>

      {/* Evidence */}
      {caseData.evidence?.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-6">Evidence</h2>
          <button
            onClick={() => setEvidenceOpen(!evidenceOpen)}
            className="bg-gray-900 text-white py-2 px-4 rounded hover:bg-gray-700 transition"
          >
            {evidenceOpen ? "Close Files" : "Open Files"}
          </button>

          {evidenceOpen && (
            <div className="grid gap-4 mt-4 sm:grid-cols-2 md:grid-cols-3">
              {caseData.evidence.map((evi) => (
                <EvidenceCard key={evi.id} evidence={evi} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Forfeit Case Button */}
      {caseStatus === "active" && (
        <button
          className="mt-6 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          onClick={async () => {
            const confirm = window.confirm("Are you sure you want to forfeit this case?");
            if (!confirm) return;
            try {
              const res = await axios.post(`/cases/${caseId}/forfeit/`);
              alert("You’ve forfeited the case.");
              setCaseStatus("inactive");
            } catch (err) {
              console.error("Failed to forfeit:", err);
              alert("There was a problem forfeiting this case.");
            }
          }}
        >
          Forfeit Case
        </button>
      )}

      {/* Back link */}
      <div>
        <Link to="/cases" className="text-blue-600 underline mb-4 inline-block">
          ← Back to case list
        </Link>
      </div>
    </div>
  );
}
