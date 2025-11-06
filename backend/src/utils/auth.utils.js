const jwt = require('jsonwebtoken');
const connection = require('./db/db.js');

const generateAccessToken = async(user_id, email)=>{
	return jwt.sign({
		id: user_id,
		email: email
	}, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: process.env.ACCESS_TOKEN_EXPIRY
	});
}

const generateRefreshAccessToken = async(user_id)=>{
	const rfa=  jwt.sign({
		id: user_id
	}, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: process.env.REFRESH_TOKEN_EXPIRY
	});

	const [result] = await connection.promise().query(
		"UPDATE employee SET refresh_access_token = ? WHERE ID = ?", [rfa, user_id]
	);

	if(result.affectedRows == 0){
		throw new Error("Token not saved or user not found");
	}

	return rfa;
}




module.exports = {
	generateRefreshAccessToken
}
