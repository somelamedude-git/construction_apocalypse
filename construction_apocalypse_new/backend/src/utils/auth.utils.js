const jwt = require('jsonwebtoken');
const connection = require('../db/db.js');

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

		// Only update database if connection is available
		// For registration, user doesn't exist yet, so skip the update
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




module.exports = {
	generateRefreshAccessToken,
	generateAccessToken
}
