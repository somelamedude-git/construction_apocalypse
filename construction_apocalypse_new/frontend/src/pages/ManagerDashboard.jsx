import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { managerAPI } from "../utils/api";
import "../styles/manager.css";

function ManagerDashboard() {
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentProject = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await managerAPI.getCurrentProject();
        if (response.success) {
          if (response.current_project) {
            setCurrentProject(response.current_project);
          } else {
            // No project selected, redirect to select project page
            navigate("/manager/select-project");
          }
        } else {
          setError(response.message || "Failed to load project");
        }
      } catch (err) {
        setError(err.message || "Failed to load project");
        console.error("Error fetching current project:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentProject();
  }, [navigate]);

  if (loading) {
    return (
      <div className="manager-container">
        <div className="manager-card">
          <p>Loading project information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="manager-container">
        <div className="manager-card">
          <p style={{ color: 'red' }}>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="manager-container">
        <div className="manager-card">
          <h2>Manager Dashboard</h2>
          <p style={{ marginBottom: "20px" }}>
            You are not currently managing any project.
          </p>
          <div className="action-buttons">
            <button
              onClick={() => navigate("/manager/apply-projects")}
              className="btn-primary"
            >
              Apply to a Project
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="manager-container">
      <div className="manager-card">
        <h2>Manager Dashboard</h2>
        <div className="project-info">
          <h3>Current Project</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Project ID:</span>
              <span className="info-value">{currentProject.ID}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Project Name:</span>
              <span className="info-value">{currentProject.name || "N/A"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Location:</span>
              <span className="info-value">{currentProject.location || "N/A"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Hours per Shift:</span>
              <span className="info-value">{currentProject.hours_per_shift || "N/A"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Required Shifts:</span>
              <span className="info-value">{currentProject.required_shifts || "N/A"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Pay per Hour:</span>
              <span className="info-value">${currentProject.pay_per_hour || "N/A"}</span>
            </div>
          </div>
        </div>
        <div className="action-buttons">
          <button onClick={() => navigate("/manager/groups")} className="btn-primary">
            View Groups
          </button>
          <button onClick={() => navigate("/manager/employees")} className="btn-primary">
            Available Employees
          </button>
          <button onClick={() => navigate("/manager/create-group")} className="btn-primary">
            Create Project Group
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;

