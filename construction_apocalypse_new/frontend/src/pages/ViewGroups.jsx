import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { managerAPI } from "../utils/api";
import "../styles/manager.css";

function ViewGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await managerAPI.getGroups();
        if (response.success) {
          setGroups(response.groups || []);
        } else {
          setError(response.message || "Failed to load groups");
        }
      } catch (err) {
        setError(err.message || "Failed to load groups");
        console.error("Error fetching groups:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) {
    return (
      <div className="manager-container">
        <div className="manager-card">
          <p>Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manager-container">
      <div className="manager-card">
        <h2>Project Groups</h2>
        {error && <div className="error-message">{error}</div>}
        
        {groups.length === 0 ? (
          <div className="no-projects">
            <p>No groups found. Create a group to get started.</p>
            <button onClick={() => navigate("/manager/create-group")} className="btn-primary" style={{ marginTop: '20px' }}>
              Create Group
            </button>
          </div>
        ) : (
          <>
            <div className="groups-list">
              {groups.map((group) => (
                <div key={group.ID} className="project-card">
                  <div className="project-details">
                    <h3>{group.group_name || `Group ${group.ID}`}</h3>
                    <div className="project-info">
                      <p><strong>Group ID:</strong> {group.ID}</p>
                      <p><strong>Project ID:</strong> {group.project || group.handling_project || "N/A"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="action-buttons" style={{ marginTop: '30px' }}>
              <button onClick={() => navigate("/manager/create-group")} className="btn-primary">
                Create New Group
              </button>
              <button onClick={() => navigate("/manager/dashboard")} className="btn-secondary">
                Back to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ViewGroups;

