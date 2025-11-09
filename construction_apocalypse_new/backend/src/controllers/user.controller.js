const connection = require('../db/db.js');

// Get user profile information
const getUserProfile = async (req, res) => {
	try {
		const user_id = req.user.id;

		const [user] = await connection.promise().query(
			`SELECT ID, name, age, email, residence_point, AVAILABILITY 
			 FROM employee 
			 WHERE ID = ?`,
			[user_id]
		);

		if (user.length === 0) {
			return res.status(404).json({
				success: false,
				message: "User not found"
			});
		}

		// Get current project if user is in any group
		const [currentProject] = await connection.promise().query(`
			SELECT Project.ID, Project.name 
			FROM Project
			INNER JOIN user_groups ON Project.ID = user_groups.project
			INNER JOIN employee_groups ON user_groups.ID = employee_groups.group_id
			INNER JOIN employee ON employee.ID = employee_groups.employee_id
			WHERE employee.ID = ?
			LIMIT 1
		`, [user_id]);

		const userData = user[0];
		return res.status(200).json({
			success: true,
			profile: {
				id: userData.ID,
				name: userData.name,
				age: userData.age,
				email: userData.email,
				residence: userData.residence_point || "Not set",
				availability: userData.AVAILABILITY || "Not set",
				currentProject: currentProject[0] || null
			}
		});
	} catch (error) {
		console.error("Error fetching user profile:", error);
		return res.status(500).json({
			success: false,
			message: "Error fetching profile"
		});
	}
};

// Get user pay information
const getUserPay = async (req, res) => {
	try {
		const user_id = req.user.id;

		// Get all completed shifts with payment information
		const [completedShifts] = await connection.promise().query(`
			SELECT 
				Shifts.payment,
				Shifts.hours_of_work,
				Shifts.Day,
				Shifts.start_time,
				Shifts.end_time
			FROM Shifts
			INNER JOIN shift_group ON Shifts.ID = shift_group.shift_id
			INNER JOIN employee_groups ON shift_group.group_id = employee_groups.group_id
			INNER JOIN employee ON employee.ID = employee_groups.employee_id
			WHERE employee.ID = ?
			ORDER BY Shifts.Day DESC, Shifts.start_time DESC
		`, [user_id]);

		// Calculate totals
		let totalPay = 0;
		let totalHours = 0;

		completedShifts.forEach(shift => {
			totalPay += parseFloat(shift.payment || 0);
			totalHours += parseFloat(shift.hours_of_work || 0);
		});

		const averageHourlyPay = totalHours > 0 ? (totalPay / totalHours).toFixed(2) : 0;

		return res.status(200).json({
			success: true,
			pay: {
				tentativePay: totalPay.toFixed(2),
				hoursWorked: totalHours.toFixed(2),
				averageHourlyPay: averageHourlyPay,
				totalShifts: completedShifts.length,
				shifts: completedShifts
			}
		});
	} catch (error) {
		console.error("Error fetching pay information:", error);
		return res.status(500).json({
			success: false,
			message: "Error fetching pay information"
		});
	}
};

module.exports = {
	getUserProfile,
	getUserPay
};

