import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import "./LandingPage.css";

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
      <div className="landing-container">
        <h1 className="landing-heading">Welcome, Detective.</h1>
        <p className="landing-subheading">Choose a cold case or check your files.</p>
    
        <div className="landing-links">
          {activeCase ? (
            <Link to={`/case/${activeCase.case_id}`} className="resume">
              Resume Case: {activeCase.case_title}
            </Link>
          ) : (
            <button onClick={handleStartNewCase} className="start">
              Start New Case
            </button>
          )}
    
          <Link to="/cases" className="cases">View All Case Files</Link>
          <Link to="/profile" className="profile">Your Profile</Link>
        </div>
      </div>
    );
    
    }