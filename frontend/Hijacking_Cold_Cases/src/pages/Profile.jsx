import { useEffect, useState } from "react";
import axios from "axios";
import React from "react";
import "./Profile.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get("http://127.0.0.1:8000/api/profile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Failed to load profile");
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="profile-container">
      <h1 className="profile-title">Profile Page</h1>
      {error && <p className="profile-info">{error}</p>}

      {profile ? (
        <>
          <p className="profile-info">
            <span className="profile-label">Username:</span> {profile.username}
          </p>
          <p className="profile-info">
            <span className="profile-label">Email:</span> {profile.email}
          </p>

          <div className="profile-stat">
            <p>
              <span className="profile-label">Cases Solved:</span>{" "}
              {profile.cases_solved ?? 0}
            </p>
            <p>
              <span className="profile-label">Incorrect Guesses:</span>{" "}
              {profile.failed_guesses ?? 0}
            </p>
            <p>
              <span className="profile-label">Success Rate:</span>{" "}
              {profile.success_rate ?? "N/A"}%
            </p>
          </div>
        </>
      ) : (
        <p className="profile-info">Loading profile...</p>
      )}
    </div>
  );
}
