const connection = require('../db/db.js');
const { encryptPassword, comparePassword } = require('../utils/password.util');
const bcrypt = require('bcrypt');
const random = require('random-string-generator');
const { generateRefreshAccessToken, generateAccessToken } = require('../utils/auth.utils');

// Add error handling later

const already_exists = async (email)=>{
	try {
		const [rows] = await connection.promise().query("SELECT ID  FROM employee WHERE email= ?", [email]);
		return rows[0];
	} catch (error) {
		console.error("Database query error in already_exists:", error);
		throw error;
	}
}

const registerUser = async(req, res)=>{
	try {
		const {name, age, email, password} = req.body;
		
		// Validate input
		if (!name || !age || !email || !password) {
			return res.status(400).json({
				success: false,
				message: "All fields are required"
			});
		}

		const exists = await already_exists(email);
		if(exists){
			return res.status(409).json({
				success: false,
				message: "Email already registered"
			});
		}

		const email_length = email.length;
		const name_length = name.length;
		const concat = name.slice(name.length / 4, name.length / 2) + email.slice(0, email.length / 10) + age;

		const random_user_ID = random(7) + "_" + Buffer.from(concat).toString("base64").slice(0, 5);
		
		// Generate refresh token directly (don't try to update DB for non-existent user)
		const jwt = require('jsonwebtoken');
		const refresh_access_token = jwt.sign(
			{ id: random_user_ID },
			process.env.REFRESH_TOKEN_SECRET || 'default-secret',
			{ expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
		);
		
		const encrypted_password = await encryptPassword(password);

		await connection.promise().query(
			"INSERT INTO employee(ID, name, age, email, password, refresh_access_token) VALUES(?,?,?,?,?,?)", 
			[random_user_ID, name, age, email, encrypted_password, refresh_access_token]
		);

		return res.status(200).json({
			success: true,
			message: "The user is registered successfully"
		});
	} catch (error) {
		console.error("Registration error:", error);
		return res.status(500).json({
			success: false,
			message: "Registration failed. Please try again.",
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
}

const loginUser = async(req, res)=>{
	const { email, password } = req.body;
	const exists = await already_exists(email);
	if(!exists){
		return res.status(400).json({
			message: "Wrong credentials have been entered"
		});
	}
	
	const user_id = exists.ID;
	const refresh_access_token = await generateRefreshAccessToken(user_id);
	await connection.promise().query(
		"UPDATE employee set refresh_access_token=? WHERE email=?", [refresh_access_token, email]
	);

	const [user_password_result] = await connection.promise().query(
		"SELECT password FROM employee WHERE email = ?", [email]
	);

	const stored_password = user_password_result[0]?.password;
	if (!stored_password) {
		return res.status(400).json({
			message: "Wrong credentials have been entered"
		});
	}

	const is_correct = await bcrypt.compare(password, stored_password);
	if(!is_correct){
		return res.status(400).json({
			message: "Wrong credentials have been entered"
		});
	}

	// Generate access token for the user
	const accessToken = await generateAccessToken(user_id, email);

	return res.status(200).json({
		success: true,
		message: "Successful login",
		token: accessToken,
		user_id: user_id
	});
}


module.exports = {
	registerUser,
	loginUser
}
