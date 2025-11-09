import React from "react";
import "../styles/profile.css";

function Profile() {
  return (
    <div className="info">
      <p>ID: <span>12345</span></p>
      <p>Name: <span>John Doe</span></p>
      <p>Age: <span>28</span></p>
      <p>Email: <span>john.doe@example.com</span></p>
      <p>Password: <span>********</span></p>
      <p>Availability: <span>Full-time</span></p>
      <p>Residence: <span>Bangalore, India</span></p>
      <p>Role: <span>Software Engineer</span></p>
      <p>Current Project: <span>Shift Management System</span></p>
    </div>
  );
}

export default Profile;
