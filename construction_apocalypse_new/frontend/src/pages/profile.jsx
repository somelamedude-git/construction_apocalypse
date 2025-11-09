import React, { useState, useEffect } from "react";
import "../styles/profile.css";
import { userAPI } from "../utils/api";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getProfile();
        if (response.success) {
          setProfile(response.profile);
        }
      } catch (err) {
        setError(err.message || "Failed to load profile");
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="info">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="info">
        <p style={{ color: 'red' }}>Error: {error}</p>
        <p>Please make sure you are logged in.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="info">
        <p>No profile data available</p>
      </div>
    );
  }

  return (
    <div className="info">
      <p>ID: <span>{profile.id}</span></p>
      <p>Name: <span>{profile.name}</span></p>
      <p>Age: <span>{profile.age}</span></p>
      <p>Email: <span>{profile.email}</span></p>
      <p>Password: <span>********</span></p>
      <p>Availability: <span>{profile.availability}</span></p>
      <p>Residence: <span>{profile.residence}</span></p>
      <p>Current Project: <span>{profile.currentProject ? profile.currentProject.name || profile.currentProject.ID : "None"}</span></p>
    </div>
  );
}

export default Profile;
