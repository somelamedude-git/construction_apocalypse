import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { managerAPI } from "../utils/api";
import "../styles/manager.css";

function ApplyForProject() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applyingProjectId, setApplyingProjectId] = useState(null);
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

  const handleApply = async (projectId) => {
    try {
      setApplyingProjectId(projectId);
      setError(null);
      const response = await managerAPI.selectProject(projectId);
      if (response.success) {
        // After successful application, go to dashboard
        navigate("/manager/dashboard");
      } else {
        setError(response.message || "Failed to apply for project");
      }
    } catch (err) {
      setError(err.message || "Failed to apply for project");
      console.error("Error applying for project:", err);
    } finally {
      setApplyingProjectId(null);
    }
  };

  if (loading) {
    return (
      <div className="manager-container">
        <div className="manager-card">
          <p>Loading available projects to apply...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manager-container">
      <div className="manager-card">
        <h2>Apply to Manage a Project</h2>
        <p style={{ color: "#666", marginBottom: "20px", textAlign: "center" }}>
          Choose one of the open projects below to become its manager.
        </p>
        {error && <div className="error-message">{error}</div>}

        {projects.length === 0 ? (
          <div className="no-projects">
            <p>
              There are currently no projects available to apply for. Please
              check back later.
            </p>
            <div className="action-buttons" style={{ marginTop: "20px" }}>
              <button
                onClick={() => navigate("/manager/dashboard")}
                className="btn-secondary"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="projects-list">
              {projects.map((project) => (
                <div key={project.ID} className="project-card">
                  <div className="project-details">
                    <h3>{project.name || `Project ${project.ID}`}</h3>
                    <div className="project-info">
                      <p>
                        <strong>Project ID:</strong> {project.ID}
                      </p>
                      <p>
                        <strong>Hours per Shift:</strong>{" "}
                        {project.hours_per_shift || "N/A"}
                      </p>
                      <p>
                        <strong>Required Shifts:</strong>{" "}
                        {project.required_shifts || "N/A"}
                      </p>
                      <p>
                        <strong>Pay per Hour:</strong> $
                        {project.pay_per_hour || "N/A"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleApply(project.ID)}
                    disabled={!!applyingProjectId}
                    className="btn-primary"
                  >
                    {applyingProjectId === project.ID
                      ? "Applying..."
                      : "Apply to Manage"}
                  </button>
                </div>
              ))}
            </div>
            <div className="action-buttons" style={{ marginTop: "30px" }}>
              <button
                onClick={() => navigate("/manager/dashboard")}
                className="btn-secondary"
              >
                Back to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ApplyForProject;


