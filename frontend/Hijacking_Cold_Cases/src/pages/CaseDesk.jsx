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
  const [showCaseBrief, setShowCaseBrief] = useState(false);

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [caseRes, peopleRes, statusRes] = await Promise.all([
          axios.get(`/cases/${caseId}/`),
          axios.get("/people/"),
          axios.get(`/cases/${caseId}/instance/`),
        ]);
        setCaseData(caseRes.data);
        setPeople(peopleRes.data);
        setInstanceStatus(statusRes.data);

        // Show case briefing popup on active case start/resume
        if (statusRes.data.status === "active") {
          setShowCaseBrief(true);
        }
      } catch (err) {
        console.error("Error loading case:", err);
      }
    };

    fetchData();
  }, [caseId]);

  // Handle suspect guess submission
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

  // Handle case forfeit
  const handleForfeit = async () => {
    const confirm = window.confirm("Are you sure you want to forfeit this case?");
    if (!confirm) return;

    try {
      await axios.post(`/cases/${caseId}/forfeit/`);
      alert("Case forfeited.");
      setInstanceStatus((prev) => ({ ...prev, status: "inactive" }));
    } catch (err) {
      console.error("Forfeit error:", err);
      alert("There was a problem forfeiting the case.");
    }
  };

  // Renders the content based on the selected drawer
  const renderDrawerContent = () => {
    if (!caseData) return null;

    switch (selectedDrawer) {
      case "victim":
        return (
          <VictimCard
            victim={{
              first_name: caseData.victim_name,
              last_name: "", // Add if needed
            }}
            occupation={caseData.victim_occupation}
            causeOfDeath={caseData.cause_of_death}
            lastKnownLocation={caseData.last_known_location}
            backgroundStory={caseData.background_story}
            photoUrl={caseData.victim?.picture || caseData.victim?.thumbnail_picture}
            initialOpen={true}
          />
        );

      case "suspects":
        return (
          <div className="card-grid">
            {caseData.characters?.map((char, index) => {
              const match = people.find(
                (p) =>
                  `${p.first_name} ${p.last_name}`.toLowerCase() === char.name.toLowerCase()
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

  if (!caseData || !instanceStatus) return <p>Loading case details...</p>;

  return (
    <div className="case-desk-container">
      {/* Sidebar with drawer buttons */}
      <div className="file-cabinet">
        <h2>File Cabinet</h2>
        <button onClick={() => setSelectedDrawer("victim")}>Victim File</button>
        <button onClick={() => setSelectedDrawer("suspects")}>Suspects</button>
        <button onClick={() => setSelectedDrawer("evidence")}>Evidence</button>

        {instanceStatus.status === "active" && (
          <button
            className="forfeit-button"
            onClick={handleForfeit}
            style={{
              marginTop: "1rem",
              backgroundColor: "#8B0000",
              color: "white",
              padding: "8px",
              borderRadius: "4px",
            }}
          >
            Forfeit Case
          </button>
        )}
      </div>

      {/* Desktop Area */}
      <div className="desktop-area">
        {/* Game Status */}
        <div className="status-bar">
          <strong>Status:</strong> {instanceStatus.status} |{" "}
          <strong>Lives:</strong> {instanceStatus.lives_remaining} |{" "}
          <strong>Guesses:</strong> {instanceStatus.guesses_made}
        </div>

        {/* Outcome Banners */}
        {instanceStatus.status === "solved" && (
          <div className="resolution-banner green">
            ✅ Case Solved! Excellent work, detective.
          </div>
        )}
        {instanceStatus.status === "failed" && (
          <div className="resolution-banner red">
            ❌ Case Failed. All lives used up.
          </div>
        )}
        {instanceStatus.status === "inactive" && (
          <div className="resolution-banner yellow">
            ⚠️ Case Forfeited. You exited this investigation.
          </div>
        )}

        {/* Final Summary shown only if case solved */}
        {instanceStatus.status === "solved" && (
          <div className="case-resolution-details">
            <h2>📂 Final Case File</h2>
            <p><strong>Killer:</strong> {caseData.killer}</p>
            <p><strong>Motive:</strong> {caseData.justification}</p>
            <p><strong>Summary:</strong> {caseData.summary}</p>
          </div>
        )}

        {/* Case Briefing Popup */}
        {showCaseBrief && (
          <div className="case-popup">
            <h2>🗂️ Case Briefing</h2>
            <p>{caseData.summary}</p>
            <button
              onClick={() => {
                setShowCaseBrief(false);
                setSelectedDrawer("victim"); // 👈 Open Victim drawer after summary
              }}
            >
              Close
            </button>
          </div>
        )}

        {/* Drawer content based on user selection */}
        {renderDrawerContent()}
      </div>
    </div>
  );
}
