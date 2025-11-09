const connection = require('../db/db.js');

const assign_shifts = async(req, res)=>{
	const user_id = req.user.id; // Handle this with middleware
	const [user] = await connection.promise().query(
		"SELECT residence_point, proximity_willingness, AVAILABILITY FROM employee WHERE ID=?", [user_id]"
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
	const today = new Date().getDay();
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

const check_in = async(req, res)=>{


module.exports = {
	show_upcoming_shifts
}
