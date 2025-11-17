const jwt = require('jsonwebtoken');
const connection = require('../db/db.js');
require('dotenv').config('../.env');

const generateAccessToken = async(user_id, email)=>{
	return jwt.sign({
		id: user_id,
		email: email
	}, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: process.env.ACCESS_TOKEN_EXPIRY
	});
}

const generateRefreshAccessToken = async(user_id)=>{
	try {
		const rfa=  jwt.sign({
			id: user_id
		}, process.env.REFRESH_TOKEN_SECRET || 'default-secret', {
			expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d'
		});

		if (connection && connection.state !== 'disconnected') {
			try {
				const [result] = await connection.promise().query(
					"UPDATE employee SET refresh_access_token = ? WHERE ID = ?", [rfa, user_id]
				);

				if(result.affectedRows == 0){
					// Don't throw error during registration - user doesn't exist yet
					console.warn("Token update failed - user may not exist yet (this is OK during registration)");
				}
			} catch (dbError) {
				console.error("Database error updating refresh token:", dbError);
				// Don't throw - token generation succeeded, DB update is secondary
			}
		}

		return rfa;
	} catch (error) {
		console.error("Error generating refresh token:", error);
		throw error;
	}
}


const isManager = async (user) => {
    try {
        if (!user || !user.id) {
            // No user → cannot be manager
            return false;
        }

        const [rows] = await connection
            .promise()
            .query(
                `SELECT 1 FROM Manager WHERE ID = ? LIMIT 1`,
                [user.id]
            );

        return rows.length > 0; // true if manager, false otherwise
    } catch (err) {
        console.error("Error in isManager():", err);
        return false; // Fail-safe — treat as not manager
    }
};

module.exports = {
	generateRefreshAccessToken,
	generateAccessToken,
	isManager
}
