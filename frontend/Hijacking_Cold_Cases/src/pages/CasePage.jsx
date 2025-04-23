import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import React from "react";

export default function CasePage() {
  const [cases, setCases] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("cases/")
      .then((res) => setCases(res.data))
      .catch((err) => console.error("Error fetching cases:", err));
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cold Case Files</h1>
      <div className="grid gap-4">
        {cases.map((c) => (
          <div
            key={c.id}
            className="block border rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <h2 className="text-lg font-semibold">{c.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {c.summary}
            </p>
            <button
              className="mt-2 text-blue-600 underline"
              onClick={() => handleStartCase(c.id)}
            >
              Start Case
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
