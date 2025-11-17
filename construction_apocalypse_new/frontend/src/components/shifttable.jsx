import { useState, useEffect } from "react";
import { shiftsAPI, authAPI, userAPI } from "../utils/api";

export default function ShiftTable() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [totalPay, setTotalPay] = useState(null);
  const [loadingPay, setLoadingPay] = useState(false);

  const formatTime = (time) => {
    if (!time) return '';
    // Convert HH:MM:SS to HH:MM AM/PM
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const fetchTotalPay = async () => {
    try {
      setLoadingPay(true);
      const response = await userAPI.getPay();
      if (response.success && response.pay) {
        setTotalPay(response.pay);
      }
    } catch (err) {
      console.error("Error fetching pay:", err);
    } finally {
      setLoadingPay(false);
    }
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
          checkedIn: shift.checked_in === 1,
          checkedOut: shift.checked_out === 1
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
        fetchTotalPay();
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

  const handleCheckIn = async (shiftId, index) => {
    try {
      const response = await shiftsAPI.checkIn(shiftId);
      if (response.message) {
        // Update the shift status
        const updated = [...shifts];
        updated[index].checkedIn = true;
        setShifts(updated);
        
        // Refresh total pay
        await fetchTotalPay();
        
        alert(response.message + (response.new_pay ? `\nTotal Pay: ₹${response.new_pay}` : ''));
      }
    } catch (err) {
      alert(err.message || "Failed to check in");
      console.error("Error checking in:", err);
    }
  };

  const handleCheckOut = async (shiftId, index) => {
    try {
      const response = await shiftsAPI.checkout(shiftId);
      if (response.message) {
        // Update the shift status
        const updated = [...shifts];
        updated[index].checkedOut = true;
        updated[index].checkedIn = true; // Keep checked in status
        setShifts(updated);
        
        // Refresh total pay
        await fetchTotalPay();
        
        alert(response.message + (response.total_pay ? `\nTotal Pay: ₹${response.total_pay}` : ''));
      }
    } catch (err) {
      alert(err.message || "Failed to check out");
      console.error("Error checking out:", err);
    }
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
      
      {/* Display Total Pay */}
      {totalPay && (
        <div style={{ 
          marginBottom: '1rem', 
          padding: '1rem', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '5px',
          border: '2px solid #4CAF50'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Total Pay</h3>
          <p style={{ margin: '0.25rem 0', fontSize: '1.1rem' }}>
            <strong>Total Pay: ₹{parseFloat(totalPay.tentativePay || 0).toFixed(2)}</strong>
          </p>
          <p style={{ margin: '0.25rem 0', color: '#666' }}>
            Hours Worked: {parseFloat(totalPay.hoursWorked || 0).toFixed(2)} hrs
          </p>
          <p style={{ margin: '0.25rem 0', color: '#666' }}>
            Average Hourly Pay: ₹{parseFloat(totalPay.averageHourlyPay || 0).toFixed(2)}/hr
          </p>
        </div>
      )}
      
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
                    onClick={() => handleCheckIn(shift.id, index)}
                    disabled={shift.checkedIn || shift.checkedOut}
                    className="checkin-btn"
                    style={{
                      opacity: (shift.checkedIn || shift.checkedOut) ? 0.6 : 1,
                      cursor: (shift.checkedIn || shift.checkedOut) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {shift.checkedIn ? 'Checked In' : 'Check In'}
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => handleCheckOut(shift.id, index)}
                    disabled={!shift.checkedIn || shift.checkedOut}
                    className="checkout-btn"
                    style={{
                      opacity: (!shift.checkedIn || shift.checkedOut) ? 0.6 : 1,
                      cursor: (!shift.checkedIn || shift.checkedOut) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {shift.checkedOut ? 'Checked Out' : 'Check Out'}
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
