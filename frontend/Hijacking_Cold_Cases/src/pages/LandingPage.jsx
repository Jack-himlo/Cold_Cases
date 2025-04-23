import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";

export default function LandingPage() {
    const [activeCase, setActiveCase] = useState(null);
    const navigate = useNavigate()

    useEffect (() => {
        const fetchActiveCase = async () => {
            try {
                const res = await axios.get("/active-case/");
                if (res.data.active) {
                    setActiveCase(res.data);
                }
            } catch(err) {
                console.error("Error fetching active case:", err);
            }
        };
        fetchActiveCase();
    }, []);
    const handleStartNewCase = () => {
        navigate('/cases');
    }



    return (
        <div className="p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome, Detective.</h1>
          <p className="mb-6 italic">Choose a cold case or check your files.</p>
    
          <div className="space-y-4">
            {activeCase ? (
              <Link
                to={`/case/${activeCase.case_id}`}
                className="block bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              >
                Resume Case: {activeCase.case_title}
              </Link>
            ) : (
              <button
                onClick={handleStartNewCase}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Start New Case
              </button>
            )}
    
            <Link
              to="/cases"
              className="block bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              View All Case Files
            </Link>
            <Link
              to="/profile"
              className="block bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded"
            >
              Your Profile
            </Link>
          </div>
        </div>
      );
    }