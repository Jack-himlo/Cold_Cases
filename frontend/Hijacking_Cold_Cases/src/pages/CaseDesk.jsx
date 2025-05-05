import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axiosInstance";
import VictimCard from "../components/VictimCard";
import SuspectCard from "../components/SuspectCard";
import EvidenceCard from "../components/EvidenceCard";
import "./CaseDesk.css";

export default function CaseDesk() {
  const { id: caseId } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [people, setPeople] = useState([]);
  const [instanceStatus, setInstanceStatus] = useState(null);
  const [selectedDrawer, setSelectedDrawer] = useState(null);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await axios.get(`/cases/${caseId}/`);
        setCaseData(res.data);
      } catch (err) {
        console.error("Error fetching case:", err);
      }
    };

    const fetchPeople = async () => {
      try {
        const res = await axios.get("/people/");
        setPeople(res.data);
      } catch (err) {
        console.error("Error fetching people:", err);
      }
    };

    const fetchStatus = async () => {
      try {
        const res = await axios.get(`/cases/${caseId}/instance/`);
        setInstanceStatus(res.data);
      } catch (err) {
        console.error("Error fetching case instance:", err);
      }
    };

    fetchCase();
    fetchPeople();
    fetchStatus();
  }, [caseId]);

  // Handle guessing the killer
  const handleGuess = async (suspectName) => {
    try {
      const res = await axios.post(`/cases/${caseId}/guess/`, {
        guess: suspectName,
      });
      alert(res.data.message);
      setInstanceStatus((prev) => ({
        ...prev,
        status: res.data.status,
        lives_remaining: res.data.status === "failed" ? 0 : prev.lives_remaining - 1,
        guesses_made: (prev?.guesses_made || 0) + 1,
      }));
    } catch (err) {
      console.error("Guess error:", err);
    }
  };

  // Handle forfeiting the case
  const handleForfeit = async () => {
    const confirm = window.confirm("Are you sure you want to forfeit this case?");
    if (!confirm) return;
    try {
      const res = await axios.post(`/cases/${caseId}/forfeit/`);
      alert("Case forfeited.");
      setInstanceStatus((prev) => ({
        ...prev,
        status: "inactive",
      }));
    } catch (err) {
      console.error("Forfeit error:", err);
      alert("There was a problem forfeiting the case.");
    }
  };

  // Drawer content logic
  const renderDrawerContent = () => {
    if (!caseData) return null;

    switch (selectedDrawer) {
      case "victim":
        return (
            <VictimCard
              victim={caseData.victim_name}
              occupation={caseData.victim_occupation}
              causeOfDeath={caseData.cause_of_death}
              lastKnownLocation={caseData.last_known_location}
              backgroundStory={caseData.background_story}
              photoUrl={caseData.victim?.picture || caseData.victim?.thumbnail_picture}
            />
          );
      case "suspects":
        return (
          <div className="card-grid">
            {caseData.characters?.map((char, index) => {
              const match = people.find(
                (p) =>
                  `${p.first_name} ${p.last_name}`.toLowerCase() ===
                  char.name.toLowerCase()
              );

              return (
                <SuspectCard
                  key={index}
                  name={char.name}
                  alibi={char.alibi}
                  clueText={
                    caseData.clues?.find(
                      (clue) => clue.character?.toLowerCase() === char.name.toLowerCase()
                    )?.text
                  }
                  photoUrl={match?.picture || match?.thumbnail_picture}
                  onGuess={handleGuess}
                  isDisabled={instanceStatus?.status !== "active"}
                />

              );
            })}
          </div>
        );
      case "evidence":
        return (
          <div className="card-grid">
            {caseData.evidence?.map((ev, index) => (
              <EvidenceCard key={index} evidence={ev} />
            ))}
          </div>
        );
      default:
        return <p>Select a drawer to begin investigating.</p>;
    }
  };

  return (
    <div className="case-desk-container">
      {/* Left drawer panel */}
      <div className="file-cabinet">
        <h2>File Cabinet</h2>
        <button onClick={() => setSelectedDrawer("victim")}>Victim File</button>
        <button onClick={() => setSelectedDrawer("suspects")}>Suspects</button>
        <button onClick={() => setSelectedDrawer("evidence")}>Evidence</button>

        {/* Forfeit Case Button - only visible if active */}
        {instanceStatus?.status === "active" && (
          <button
            className="forfeit-button"
            onClick={handleForfeit}
            style={{ marginTop: "1rem", backgroundColor: "#8B0000", color: "white", padding: "8px", borderRadius: "4px" }}
          >
            Forfeit Case
          </button>
        )}
      </div>

      {/* Right workspace area */}
      <div className="desktop-area">
        <div className="status-bar">
          {instanceStatus ? (
            <p>
              <strong>Status:</strong> {instanceStatus.status} |{" "}
              <strong>Lives:</strong> {instanceStatus.lives_remaining} |{" "}
              <strong>Guesses:</strong> {instanceStatus.guesses_made}
            </p>
          ) : (
            <p>Loading case status...</p>
          )}
        </div>

        {/* Case resolution banners */}
        {instanceStatus?.status === "solved" && (
          <div className="resolution-banner green">
            ✅ Case Solved! Excellent work, detective.
          </div>
        )}
        {instanceStatus?.status === "failed" && (
          <div className="resolution-banner red">
            ❌ Case Failed. All lives used up.
          </div>
        )}
        {instanceStatus?.status === "inactive" && (
          <div className="resolution-banner yellow">
            ⚠️ Case Forfeited. You exited this investigation.
          </div>
        )}

        {/* Killer & Justification Reveal */}
        {instanceStatus?.status === "solved" && caseData?.killer && (
          <div className="case-resolution-details">
            <h3 className="mt-4 font-bold text-lg">🧩 Case Resolution</h3>
            <p><strong>Killer:</strong> {caseData.killer}</p>
            <p><strong>Motive:</strong> {caseData.justification}</p>
          </div>
        )}

        {/* Drawer content */}
        <h2>Desktop</h2>
        {renderDrawerContent()}
      </div>
    </div>
  );
}
