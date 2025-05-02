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
    fetchCase();
  }, [caseId]);

  const renderDrawerContent = () => {
    if (!caseData) return null;
  
    switch (selectedDrawer) {
      case "victim":
        return <VictimCard victim={caseData.victim} />;
      case "suspects":
        return (
          <div className="card-grid">
            {caseData.characters?.map((char, index) => (
              <SuspectCard key={index} suspect={char} />
            ))}
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
      <div className="file-cabinet">
        <h2>File Cabinet</h2>
        <button onClick={() => setSelectedDrawer("victim")}>Victim File</button>
        <button onClick={() => setSelectedDrawer("suspects")}>Suspects</button>
        <button onClick={() => setSelectedDrawer("evidence")}>Evidence</button>
      </div>

      <div className="desktop-area">
        <h2>Desktop</h2>
        {renderDrawerContent()}
      </div>
    </div>
  );
}
