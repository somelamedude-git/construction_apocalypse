const connection = require('../db/db.js');

const fetchProject = async(req, res)=>{
	const user_id = req.user.id;
	const [use_projects] = await connection.promise().query(`
	SELECT Project.ID FROM Project
	INNER JOIN user_groups
	ON Project.ID=user_groups.project
	INNER JOIN employee_groups ON user_groups.ID=employee_groups.group_id
	INNER JOIN employee ON employee.ID = employee_groups.employee_id
	WHERE employee.ID = ?`, [user_id]);

	const projectIDs = use_projects.map(row=>row.ID);
	return res.status(200).json({
		success: true,
		project_ids: projectIDs
	});
}

const show_project_details = async(req, res)=>{
	const {project_id} = req.body;

	const [project_details] =await  connection.promise().query(`
	SELECT location.name, Building.name, Building.ID, employee.name, employee.ID, employee.email
	FROM Project INNER JOIN Building ON Project.Building_ID=Building.ID
	INNER JOIN location ON location.ID=Building.location_id
	LEFT JOIN employee ON Project.Manager=employee.ID
	WHERE Project.ID=?`, [project_id]);

	return res.status(200).json({
		success: true,
	project_details: project_details
	});
}

module.exports = {
	fetchProject,
	show_project_details
}


