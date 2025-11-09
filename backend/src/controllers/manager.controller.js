const connection = require('../db/db.js');
const random = require('random-string-generator');

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
        const { group_name } = req.body;

        if (!group_name) {
            return res.status(400).json({ 
                success: false,
                message: "Group name is required",
            });
        }

        const [manager_project] = await connection.promise().query(
            `SELECT Project.ID
             FROM Project
             INNER JOIN Manager
             ON Project.ID = Manager.handling_project
             WHERE Manager.ID = ?`,
            [user_id]
        );

        if (manager_project.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: "You are not managing any project",
            });
        }

        const project_id = manager_project[0].ID;

        const [name_exists_under_project] = await connection.promise().query(
            `SELECT 1
             FROM user_groups
             WHERE project = ? AND group_name = ?
             LIMIT 1`,
            [project_id, group_name]
        );

        if (name_exists_under_project.length !== 0) {
            return res.status(409).json({ 
                success: false,
                message: `A group with the name "${group_name}" already exists under this project`,
            });
        }

        const group_id = crypto.randomBytes(4).toString('hex') + group_name;

        await connection.promise().query(
            `INSERT INTO user_groups (ID, project, group_name) VALUES (?, ?, ?)`,
            [group_id, project_id, group_name]
        );

        return res.status(201).json({
            success: true,
            message: `Group "${group_name}" created successfully under your project`,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "An unexpected server error occurred",
        });
    }
};




























