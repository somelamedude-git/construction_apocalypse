import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { groupAPI } from "../utils/api";
import "../styles/manager.css";

function GroupMembers() {
  const { groupId: paramGroupId } = useParams();
  const [groupIdInput, setGroupIdInput] = useState(paramGroupId || "");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(!!paramGroupId);
  const [error, setError] = useState(null);
  const [lastFetchedId, setLastFetchedId] = useState(paramGroupId || "");

  const fetchMembers = async (groupId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await groupAPI.getMembers(groupId);
      if (response.success) {
        setMembers(response.employees || []);
        setLastFetchedId(response.group_id || groupId);
      } else {
        setMembers([]);
        setLastFetchedId(groupId);
        setError(response.message || "Failed to fetch group members");
      }
    } catch (err) {
      setMembers([]);
      setLastFetchedId(groupId);
      setError(err.message || "Failed to fetch group members");
      console.error("Error fetching group members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramGroupId) {
      fetchMembers(paramGroupId);
    }
  }, [paramGroupId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!groupIdInput.trim()) {
      setError("Please enter a group ID");
      return;
    }
    fetchMembers(groupIdInput.trim());
  };

  return (
    <div className="manager-container">
      <div className="manager-card">
        <h2>Group Members</h2>
        <p style={{ color: "#666", marginBottom: "20px", textAlign: "center" }}>
          Enter a group ID to view all members in that group.
        </p>

        <form onSubmit={handleSubmit} className="group-form" style={{ marginBottom: "20px" }}>
          <div className="form-group">
            <label htmlFor="groupId">Group ID</label>
            <input
              id="groupId"
              type="text"
              value={groupIdInput}
              onChange={(e) => setGroupIdInput(e.target.value)}
              placeholder="Enter group ID"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              View Members
            </button>
          </div>
        </form>

        {loading ? (
          <div className="no-projects">
            <p>Loading members...</p>
          </div>
        ) : (
          <>
            {error && <div className="error-message">{error}</div>}
            {lastFetchedId && !error && (
              <p style={{ textAlign: "center", marginBottom: "10px" }}>
                Showing members for group <strong>{lastFetchedId}</strong>
              </p>
            )}
            {members.length === 0 ? (
              <div className="no-projects">
                <p>No members found for this group.</p>
              </div>
            ) : (
              <div className="employees-list">
                {members.map((member, index) => (
                  <div key={`${member.email}-${index}`} className="project-card">
                    <div className="project-details">
                      <h3>{member.name || "Member"}</h3>
                      <div className="project-info">
                        <p>
                          <strong>Email:</strong> {member.email || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default GroupMembers;


