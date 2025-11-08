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

	if(shifts.length==0){
		const avail_ = await connection.promise().query(`
		

