import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { managerAPI } from "../utils/api";
import "../styles/manager.css";

function AvailableEmployees() {
  const [employees, setEmployees] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [selectedGroup, setSelectedGroup] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both employees and groups
        const [employeesResponse, groupsResponse] = await Promise.all([
          managerAPI.getEmployees(),
          managerAPI.getGroups()
        ]);

        if (employeesResponse.success) {
          setEmployees(employeesResponse.users || []);
        } else {
          setError(employeesResponse.message || "Failed to load employees");
        }

        if (groupsResponse.success) {
          setGroups(groupsResponse.groups || []);
        }
      } catch (err) {
        setError(err.message || "Failed to load data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEmployeeToggle = (employeeId) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEmployees.size === employees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(employees.map(emp => emp.ID)));
    }
  };

  const handleAddToGroup = async () => {
    if (!selectedGroup) {
      setError("Please select a group");
      return;
    }

    if (selectedEmployees.size === 0) {
      setError("Please select at least one employee");
      return;
    }

    setAdding(true);
    setError(null);
    setSuccess(null);

    try {
      const employeeIds = Array.from(selectedEmployees);
      const results = await Promise.allSettled(
        employeeIds.map(employeeId => 
          managerAPI.addEmployeeToGroup(employeeId, selectedGroup)
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - successful;

      if (successful > 0) {
        setSuccess(`Successfully added ${successful} employee(s) to the group${failed > 0 ? ` (${failed} failed)` : ''}`);
        
        // Refresh employee list
        const response = await managerAPI.getEmployees();
        if (response.success) {
          setEmployees(response.users || []);
          setSelectedEmployees(new Set());
          setSelectedGroup("");
        }
      } else {
        const firstError = results.find(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));
        setError(firstError?.reason?.message || firstError?.value?.message || "Failed to add employees to group");
      }
    } catch (err) {
      setError(err.message || "Failed to add employees to group");
      console.error("Error adding employees to group:", err);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="manager-container">
        <div className="manager-card">
          <p>Loading available employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manager-container">
      <div className="manager-card">
        <h2>Available Employees</h2>
        <p style={{ color: '#666', marginBottom: '20px', textAlign: 'center' }}>
          Employees who are not currently assigned to any group
        </p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {employees.length === 0 ? (
          <div className="no-projects">
            <p>No available employees found. All employees are currently assigned to groups.</p>
            <div className="action-buttons" style={{ marginTop: '20px' }}>
              <button onClick={() => navigate("/manager/dashboard")} className="btn-secondary">
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
            {groups.length > 0 && (
              <div className="add-to-group-section" style={{ marginBottom: '30px', padding: '20px', background: '#f7f9fc', borderRadius: '10px' }}>
                <h3 style={{ marginBottom: '15px', color: '#00bfff' }}>Add Employees to Group</h3>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label htmlFor="group-select" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Select Group:
                  </label>
                  <select
                    id="group-select"
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="">Choose a group...</option>
                    {groups.map((group) => (
                      <option key={group.ID} value={group.ID}>
                        {group.group_name || `Group ${group.ID}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="action-buttons">
                  <button
                    onClick={handleAddToGroup}
                    disabled={adding || selectedEmployees.size === 0 || !selectedGroup}
                    className="btn-primary"
                  >
                    {adding ? "Adding..." : `Add ${selectedEmployees.size} Selected Employee(s) to Group`}
                  </button>
                </div>
              </div>
            )}

            {groups.length === 0 && (
              <div className="error-message" style={{ marginBottom: '20px' }}>
                No groups available. Please create a group first to add employees.
              </div>
            )}

            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Select Employees:</h3>
              <button
                onClick={handleSelectAll}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                {selectedEmployees.size === employees.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="employees-list">
              {employees.map((employee) => (
                <div key={employee.ID} className="project-card" style={{ 
                  border: selectedEmployees.has(employee.ID) ? '2px solid #00bfff' : '2px solid transparent',
                  backgroundColor: selectedEmployees.has(employee.ID) ? '#e6f4ff' : '#f7f9fc'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', width: '100%' }}>
                    <input
                      type="checkbox"
                      checked={selectedEmployees.has(employee.ID)}
                      onChange={() => handleEmployeeToggle(employee.ID)}
                      style={{
                        marginTop: '5px',
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer'
                      }}
                    />
                    <div className="project-details" style={{ flex: 1 }}>
                      <h3>{employee.name || `Employee ${employee.ID}`}</h3>
                      <div className="project-info">
                        <p><strong>Employee ID:</strong> {employee.ID}</p>
                        <p><strong>Email:</strong> {employee.email || "N/A"}</p>
                        <p><strong>Age:</strong> {employee.age || "N/A"}</p>
                        {employee.residence_point && (
                          <p><strong>Residence:</strong> {employee.residence_point}</p>
                        )}
                        {employee.AVAILABILITY && (
                          <p><strong>Availability:</strong> {employee.AVAILABILITY}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="action-buttons" style={{ marginTop: '30px' }}>
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

export default AvailableEmployees;

