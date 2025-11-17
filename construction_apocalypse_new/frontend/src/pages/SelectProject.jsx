import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { managerAPI } from "../utils/api";
import "../styles/manager.css";

function SelectProject() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selecting, setSelecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvailableProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await managerAPI.getAvailableProjects();
        if (response.success) {
          setProjects(response.projects || []);
        } else {
          setError(response.message || "Failed to load projects");
        }
      } catch (err) {
        setError(err.message || "Failed to load projects");
        console.error("Error fetching available projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableProjects();
  }, []);

  const handleSelectProject = async (projectId) => {
    try {
      setSelecting(true);
      setError(null);
      const response = await managerAPI.selectProject(projectId);
      if (response.success) {
        navigate("/manager/dashboard");
      } else {
        setError(response.message || "Failed to select project");
      }
    } catch (err) {
      setError(err.message || "Failed to select project");
      console.error("Error selecting project:", err);
    } finally {
      setSelecting(false);
    }
  };

  if (loading) {
    return (
      <div className="manager-container">
        <div className="manager-card">
          <p>Loading available projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manager-container">
      <div className="manager-card">
        <h2>Select a Project to Manage</h2>
        {error && <div className="error-message">{error}</div>}
        
        {projects.length === 0 ? (
          <div className="no-projects">
            <p>No available projects to manage at this time.</p>
          </div>
        ) : (
          <div className="projects-list">
            {projects.map((project) => (
              <div key={project.ID} className="project-card">
                <div className="project-details">
                  <h3>{project.name || `Project ${project.ID}`}</h3>
                  <div className="project-info">
                    <p><strong>Location:</strong> {project.location || "N/A"}</p>
                    <p><strong>Hours per Shift:</strong> {project.hours_per_shift || "N/A"}</p>
                    <p><strong>Required Shifts:</strong> {project.required_shifts || "N/A"}</p>
                    <p><strong>Pay per Hour:</strong> ${project.pay_per_hour || "N/A"}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSelectProject(project.ID)}
                  disabled={selecting}
                  className="btn-primary"
                >
                  {selecting ? "Selecting..." : "Select Project"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SelectProject;

