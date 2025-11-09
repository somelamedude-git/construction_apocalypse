const connection = require('../db/db.js');

const show_project_groups = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [groups_under_manager] = await connection.promise().query(`
      SELECT user_groups.*
      FROM user_groups
      INNER JOIN Project ON user_groups.project = Project.ID
      INNER JOIN Manager ON Manager.handling_project = Project.ID
      WHERE Manager.ID = ?;
    `, [user_id]);

    if (groups_under_manager.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No groups found,  either you haven't created any groups or you're not managing a project.",
      });
    }

    return res.status(200).json({
      success: true,
      groups: groups_under_manager,
    });

  } catch (error) {
    console.error("Error fetching project groups:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching project groups.",
      error: error.message,
    });
  }
};
