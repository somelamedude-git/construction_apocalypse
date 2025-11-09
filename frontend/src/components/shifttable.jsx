import { useState } from "react";

export default function ShiftTable() {
  const [shifts, setShifts] = useState([
    { date: "2025-10-23", timing: "9:00 AM - 5:00 PM", pay: "$100", location: "Office A", checkedIn: false },
    { date: "2025-10-24", timing: "10:00 AM - 6:00 PM", pay: "$110", location: "Office B", checkedIn: false },
    { date: "2025-10-25", timing: "8:00 AM - 4:00 PM", pay: "$90", location: "Office C", checkedIn: false },
  ]);

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

  return (
    <div className="checkin">
      <h2>Check In</h2>
      <table id="shifttable">
        <thead>
          <tr>
            <th>Date</th>
            <th>Timing</th>
            <th>Pay</th>
            <th>Location</th>
            <th>Check In</th>
            <th>Check Out</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift, index) => (
            <tr key={index}>
              <td>{shift.date}</td>
              <td>{shift.timing}</td>
              <td>{shift.pay}</td>
              <td>{shift.location}</td>
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
    </div>
  );
}
