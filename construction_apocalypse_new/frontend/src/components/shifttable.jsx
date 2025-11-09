import { useState, useEffect } from "react";
import { shiftsAPI, authAPI } from "../utils/api";

export default function ShiftTable() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const formatTime = (time) => {
    if (!time) return '';
    // Convert HH:MM:SS to HH:MM AM/PM
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const fetchTodayShifts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await shiftsAPI.getTodayShifts();
      if (response.success && response.shifts) {
        // Format shifts for display
        const formattedShifts = response.shifts.map(shift => ({
          id: shift.ID,
          day: shift.Day,
          startTime: shift.start_time,
          endTime: shift.end_time,
          timing: `${formatTime(shift.start_time)} - ${formatTime(shift.end_time)}`,
          pay: `₹${shift.payment || 0}`,
          hours: shift.hours_of_work || 0,
          checkedIn: false // TODO: Implement actual check-in status
        }));
        setShifts(formattedShifts);
      } else {
        setShifts([]);
      }
    } catch (err) {
      // If not authenticated, don't show error
      if (err.message && err.message.includes('token')) {
        setShifts([]);
      } else {
        setError(err.message || "Failed to fetch shifts");
        console.error("Error fetching shifts:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authAPI.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        fetchTodayShifts();
      } else {
        setShifts([]);
        setLoading(false);
      }
    };

    checkAuth();
    
    // Listen for storage changes (when user logs in/out)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check periodically for auth changes
    const interval = setInterval(checkAuth, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleCheckIn = (index) => {
    const updated = [...shifts];
    updated[index].checkedIn = true;
    setShifts(updated);
    alert("Checked in");
  };

  const handleCheckOut = (index) => {
    const updated = shifts.filter((_, i) => i !== index);
    setShifts(updated);
    alert("Checked out");
  };

  // If not logged in, show the table headers and a single full-width row
  // with a login prompt so the layout remains identical (no data rows).
  if (!isAuthenticated) {
    return (
      <div className="checkin">
        <h2>Check In - Today's Shifts</h2>
        <table id="shifttable">
          <thead>
            <tr>
              <th>Day</th>
              <th>Timing</th>
              <th>Pay</th>
              <th>Hours</th>
              <th>Check In</th>
              <th>Check Out</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', color: '#666', padding: '1rem' }}>
                You must be logged in to view shifts. Please log in.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="checkin">
        <h2>Check In</h2>
        <p>Loading shifts...</p>
      </div>
    );
  }

  return (
    <div className="checkin">
      <h2>Check In - Today's Shifts</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {shifts.length === 0 && !error && (
        <p>No shifts scheduled for today.</p>
      )}
      {shifts.length > 0 && (
        <table id="shifttable">
          <thead>
            <tr>
              <th>Day</th>
              <th>Timing</th>
              <th>Pay</th>
              <th>Hours</th>
              <th>Check In</th>
              <th>Check Out</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift, index) => (
              <tr key={shift.id || index}>
                <td>{shift.day}</td>
                <td>{shift.timing}</td>
                <td>{shift.pay}</td>
                <td>{shift.hours} hrs</td>
                <td>
                  <button
                    onClick={() => handleCheckIn(index)}
                    disabled={shift.checkedIn}
                    className="checkin-btn"
                  >
                    Check In
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => handleCheckOut(index)}
                    disabled={!shift.checkedIn}
                    className="checkout-btn"
                  >
                    Check Out
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
