import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import React from "react";
import './CasePage.css';




export default function CasePage() {
  const [cases, setCases] = useState([]);
  const [activeCaseId, setActiveCaseId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCasesAndActive = async () => {
      try {
        const [casesRes, activeRes] = await Promise.all([
          axios.get("/cases/"),
          axios.get("/active-case/"),
        ]);

        setCases(casesRes.data);
        if (activeRes.data.active) {
          setActiveCaseId(activeRes.data.case_id);
        }
      } catch (err) {
        console.error("Error fetching cases or active case:", err);
      }
    };

    fetchCasesAndActive();
  }, []);

  const handleStartCase = async (caseId) => {
    try {
      const res = await axios.post(`/cases/${caseId}/start/`);
      console.log("Case started:", res.data);
      navigate(`/case/${caseId}`);
    } catch (err) {
      console.error("Failed to start case:", err);
    }
  };

  return (
    <div className="case-page">
      <h1 className="case-title">Cold Case Files</h1>
      <div>
        {cases.map((c) => (
          <div key={c.id} className="case-card">
            <h2 className="case-name">{c.title}</h2>
            <p className="case-summary">{c.summary}</p>
  
            {activeCaseId === c.id ? (
              <button
                className="resume-btn"
                onClick={() => navigate(`/case/${c.id}`)}
              >
                Resume Case
              </button>
            ) : (
              <button
                className="start-btn"
                onClick={() => handleStartCase(c.id)}
              >
                Start Case
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
  
}
