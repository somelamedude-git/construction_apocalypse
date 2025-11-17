const connection = require('../db/db.js');

const assign_shifts = async(req, res)=>{
	const user_id = req.user.id; // Handle this with middleware
	const [user] = await connection.promise().query(
		"SELECT residence_point, residence, AVAILABILITY FROM employee WHERE ID=?", [user_id]
	);

	const extract_user = user[0];
   const [shifts] = await connection.promise().query(`
            SELECT s.*
            FROM Shifts s
            INNER JOIN shift_group sg ON s.ID = sg.shift_id
            INNER JOIN employee_groups eg ON sg.group_id = eg.group_id
            INNER JOIN employee e ON e.ID = eg.employee_id
            WHERE e.ID = ?;
        `, [user_id]);
}


const show_upcoming_shifts = async(req, res)=>{
	const user_id = req.user.id;
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const today = days[new Date().getDay()];
	const now = new Date();
	const current_time = now.toTimeString().split(' ')[0];

	const [user_shifts] = await connection.promise().query(`
	SELECT Shifts.* FROM Shifts INNER JOIN shift_group ON
	Shifts.ID=shift_group.shift_id
	INNER JOIN employee_groups ON employee_groups.group_id=shift_group.group_id
	INNER JOIN employee ON employee.ID=employee_groups.employee_id WHERE employee.ID=? AND 
	Shifts.Day=? AND start_time>? ORDER BY start_time ASC`, [user_id, today, current_time]);

	return res.status(200).json({
		success: true,
		shifts: user_shifts
	});
}

const getTodayShifts = async(req, res)=>{
	try {
		const user_id = req.user.id;
		const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		const today = days[new Date().getDay()];
		const todayDate = new Date();
		todayDate.setHours(0, 0, 0, 0);

		const [user_shifts] = await connection.promise().query(`
			SELECT Shifts.*, 
				CASE WHEN Attendance.employee_id IS NOT NULL THEN 1 ELSE 0 END as checked_in,
				0 as checked_out
			FROM Shifts 
			INNER JOIN shift_group ON Shifts.ID=shift_group.shift_id
			INNER JOIN employee_groups ON employee_groups.group_id=shift_group.group_id
			INNER JOIN employee ON employee.ID=employee_groups.employee_id 
			LEFT JOIN Attendance ON Attendance.shift_id = Shifts.ID 
				AND Attendance.employee_id = ? 
				AND Attendance.date_of_shift = DATE(?)
			WHERE employee.ID=? AND Shifts.Day=?
			ORDER BY Shifts.start_time ASC
		`, [user_id, todayDate, user_id, today]);

		return res.status(200).json({
			success: true,
			shifts: user_shifts
		});
	} catch (error) {
		console.error("Error fetching today's shifts:", error);
		return res.status(500).json({
			success: false,
			message: "Error fetching shifts"
		});
	}
}

const check_in = async (req, res) => {
    try {
        const { shift_id } = req.body;
        const user_id = req.user.id;
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        // Check if already checked in
        const [existingAttendance] = await connection.promise().query(
            `SELECT * FROM Attendance WHERE employee_id = ? AND shift_id = ? AND date_of_shift = DATE(?)`,
            [user_id, shift_id, todayDate]
        );

        if (existingAttendance.length > 0) {
            return res.status(400).json({ message: "Already checked in for this shift" });
        }

        const [shiftRows] = await connection.promise().query(
            `SELECT * FROM Shifts WHERE Shifts.ID = ?`,
            [shift_id]
        );

        if (shiftRows.length === 0) {
            return res.status(404).json({ message: "Shift not found" });
        }

        const shift_ = shiftRows[0];

        const [empRows] = await connection.promise().query(
            `SELECT total_pay FROM employee WHERE ID = ?`,
            [user_id]
        );

        if (empRows.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const employee = empRows[0];

        await connection.promise().query(
            `UPDATE employee SET total_pay = ? WHERE employee.ID = ?`,
            [employee.total_pay + shift_.payment, user_id]  
        );

        await connection.promise().query(
            `INSERT INTO Attendance (employee_id, shift_id, date_of_shift) VALUES (?, ?, DATE(?))`,
            [user_id, shift_id, todayDate]
        );

        return res.json({ message: "Check-in successful", new_pay: employee.total_pay + shift_.payment });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const checkout = async (req, res) => {
    try {
        const { shift_id } = req.body;
        const user_id = req.user.id;
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        // Check if checked in
        const [attendanceRows] = await connection.promise().query(
            `SELECT * FROM Attendance WHERE employee_id = ? AND shift_id = ? AND date_of_shift = DATE(?)`,
            [user_id, shift_id, todayDate]
        );

        if (attendanceRows.length === 0) {
            return res.status(400).json({ message: "You must check in before checking out" });
        }

        // Since there's no checkout_time field, checkout is just a confirmation
        // that the employee has completed the shift (they already checked in)
        // Get updated total pay
        const [empRows] = await connection.promise().query(
            `SELECT total_pay FROM employee WHERE ID = ?`,
            [user_id]
        );

        return res.json({ 
            message: "Check-out successful", 
            total_pay: empRows[0].total_pay 
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
	show_upcoming_shifts,
	assign_shifts,
	check_in,
	checkout,
	getTodayShifts
}
