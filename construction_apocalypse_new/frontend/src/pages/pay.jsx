import React, { useState, useEffect } from "react";
import "../styles/pay.css";
import { userAPI } from "../utils/api";

function Pay() {
  const [payData, setPayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPay = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getPay();
        if (response.success) {
          setPayData(response.pay);
        }
      } catch (err) {
        setError(err.message || "Failed to load pay information");
        console.error("Error fetching pay:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPay();
  }, []);

  if (loading) {
    return (
      <div className="payment">
        <p>Loading pay information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment">
        <p style={{ color: 'red' }}>Error: {error}</p>
        <p>Please make sure you are logged in.</p>
      </div>
    );
  }

  if (!payData) {
    return (
      <div className="payment">
        <p>No pay data available</p>
      </div>
    );
  }

  return (
    <div className="payment">
      <p>Tentative Pay: <span>₹{payData.tentativePay}</span></p>
      <p>Hours Worked: <span>{payData.hoursWorked}</span></p>
      <p>Average Hourly Pay: <span>₹{payData.averageHourlyPay}/hr</span></p>
      {payData.totalShifts > 0 && (
        <p>Total Shifts Completed: <span>{payData.totalShifts}</span></p>
      )}
    </div>
  );
}

export default Pay;
