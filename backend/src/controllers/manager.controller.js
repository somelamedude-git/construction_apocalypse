const connection = require('../db/db.js');
const random = require('random-string-generator');
const crypto = require('crypto');
const {randomBytes} = require('crypto');

const fetch_upcoming_projects = async (req, res) => {
    try {
        const user_id = req.user.id;

        const [user] = await connection.promise().query(
            `SELECT * FROM Manager WHERE ID = ?`,
            [user_id]
        );

        if (user.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Unauthorized access",
            });
        }

        const [current_project] = await connection.promise().query(
            `SELECT * 
             FROM Project 
             INNER JOIN Manager 
             ON Manager.handling_project = Project.ID 
             WHERE Manager.ID = ?`,
            [user_id]
        );

        return res.status(200).json({
            success: true,
            current_project: current_project[0] || null,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


const select_project = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { project_id } = req.body;

        const [user] = await connection.promise().query(
            `SELECT * FROM Manager WHERE ID = ?`,
            [user_id]
        );

        if (user.length === 0) {
            return res.status(401).json({ 
                success: false,
                message: "Unauthorized: manager not found or invalid token",
            });
        }

        if (user[0].handling_project != null) {
            return res.status(409).json({ 
                success: false,
                message: "Conflict: you already manage a project",
            });
        }

        const [project_exists] = await connection.promise().query(
            `SELECT 1 FROM Project WHERE ID = ? LIMIT 1`,
            [project_id]
        );

        if (project_exists.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: "Project not found",
            });
        }

        const [project_manager_exists] = await connection.promise().query(
            `SELECT 1
             FROM Manager
             WHERE handling_project = ?
             LIMIT 1`,
            [project_id]
        );

        if (project_manager_exists.length !== 0) {
            return res.status(409).json({ 
                success: false,
                message: "Conflict: this project already has a manager",
            });
        }

        await connection.promise().query(
            `UPDATE Manager SET handling_project = ? WHERE ID = ?`,
            [project_id, user_id]
        );

        return res.status(200).json({ 
            success: true,
            message: "You are now registered as the manager of this project",
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            success: false,
            message: "An unexpected server error occurred",
        });
    }
};

const create_project_group = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { group_name, start_time, end_time, day } = req.body;

    if (!group_name || !start_time || !end_time || !day) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields: group_name, start_time, end_time, and day",
      });
    }

    const start = new Date(`1970-01-01T${start_time}:00Z`);
    const end = new Date(`1970-01-01T${end_time}:00Z`);

    let diffMs = end - start;
    if (diffMs < 0) {
      end.setDate(end.getDate() + 1);
      diffMs = end - start;
    }

    const diffHours = diffMs / (1000 * 60 * 60);

    const [manager_project] = await connection.promise().query(
      `SELECT Project.ID, Project.hours_per_shift, Project.required_shifts, Project.pay_per_hour
       FROM Project
       INNER JOIN Manager ON Project.ID = Manager.handling_project
       WHERE Manager.ID = ?`,
      [user_id]
    );

    if (manager_project.length === 0) {
      return res.status(404).json({
        success: false,
        message: "You are not managing any project.",
      });
    }

    const project = manager_project[0];

    if (project.hours_per_shift != diffHours) {
      return res.status(400).json({
        success: false,
        message: `Hours per shift must be exactly ${project.hours_per_shift} hours.`,
      });
    }

    const [shifts] = await connection.promise().query(
      `SELECT Shifts.Day, Shifts.start_time, Shifts.end_time
       FROM Shifts
       WHERE Shifts.project = ?`,
      [project.ID]
    );

    if (shifts.length >= project.required_shifts) {
      return res.status(409).json({
        success: false,
        message: "Maximum required shifts already created. Modify existing groups instead.",
      });
    }

    const duplicateShift = shifts.find(
      (s) => s.Day === day && s.start_time === start_time && s.end_time === end_time
    );

    if (duplicateShift) {
      return res.status(409).json({
        success: false,
        message: "This exact shift already exists for the project.",
      });
    }

    const [existingGroup] = await connection.promise().query(
      `SELECT 1 FROM user_groups WHERE project = ? AND group_name = ? LIMIT 1`,
      [project.ID, group_name]
    );

    if (existingGroup.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A group with this name already exists under the project.",
      });
    }

    const group_id = crypto.randomBytes(4).toString("hex") + group_name;
    const shift_id = crypto.randomBytes(4).toString("hex");

    const total_pay = project.pay_per_hour * diffHours;

    await connection.promise().query(
      `INSERT INTO user_groups (ID, project, group_name)
       VALUES (?, ?, ?)`,
      [group_id, project.ID, group_name]
    );

    await connection.promise().query(
      `INSERT INTO Shifts (Day, start_time, end_time, ID, project, hours_of_work, payment)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [day, start_time, end_time, shift_id, project.ID, diffHours, total_pay]
    );

    await connection.promise().query(
      `INSERT INTO shift_group (group_id, shift_id) VALUES (?, ?)`,
      [group_id, shift_id]
    );

    return res.status(201).json({
      success: true,
      message: "Project group and shift created successfully.",
      data: {
        group_id,
        shift_id,
        group_name,
        day,
        start_time,
        end_time,
        diffHours,
        total_pay,
      },
    });

  } catch (error) {
    console.error("Error creating project group:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      error: error.message,
    });
  }
};


module.exports = {
	fetch_upcoming_projects,
	select_project,
	create_project_group
}
