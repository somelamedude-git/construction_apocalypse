import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { managerAPI } from "../utils/api";
import "../styles/manager.css";

function CreateGroup() {
  const [currentProject, setCurrentProject] = useState(null);
  const [formData, setFormData] = useState({
    group_name: "",
    start_time: "",
    end_time: "",
    day: ""
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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
            setError("You need to select a project first");
            setTimeout(() => navigate("/manager/select-project"), 2000);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const response = await managerAPI.createProjectGroup(formData);
      if (response.success) {
        setSuccess(response.message || "Group created successfully!");
        // Reset form
        setFormData({
          group_name: "",
          start_time: "",
          end_time: "",
          day: ""
        });
        // Optionally redirect after a delay
        setTimeout(() => {
          navigate("/manager/dashboard");
        }, 2000);
      } else {
        setError(response.message || "Failed to create group");
      }
    } catch (err) {
      setError(err.message || "Failed to create group");
      console.error("Error creating group:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="manager-container">
        <div className="manager-card">
          <p>Loading project information...</p>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="manager-container">
        <div className="manager-card">
          <p style={{ color: 'red' }}>Error: {error}</p>
          <p>Redirecting to select project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manager-container">
      <div className="manager-card">
        <h2>Create Project Group</h2>
        <div className="project-info-section">
          <h3>Current Project: {currentProject.name || `Project ${currentProject.ID}`}</h3>
          <p><strong>Hours per Shift:</strong> {currentProject.hours_per_shift}</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="group-form">
          <div className="form-group">
            <label htmlFor="group_name">Group Name:</label>
            <input
              type="text"
              id="group_name"
              name="group_name"
              value={formData.group_name}
              onChange={handleChange}
              required
              placeholder="Enter group name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="day">Day:</label>
            <select
              id="day"
              name="day"
              value={formData.day}
              onChange={handleChange}
              required
            >
              <option value="">Select a day</option>
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_time">Start Time:</label>
              <input
                type="time"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="end_time">End Time:</label>
              <input
                type="time"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? "Creating..." : "Create Group"}
            </button>
            <button type="button" onClick={() => navigate("/manager/dashboard")} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateGroup;

