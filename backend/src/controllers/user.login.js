const connection = require('./db/db.js');
const { encryptPassword, comparePassword } = require('./utils/password.util');
const bcrypt = require('bcrypt');
const random = require('random-string-generator');
const { generateRefreshAccessToken, generateAccessToken } = require('../utils/auth.utils');

// Add error handling later

const already_exists = async (email)=>{
	const [rows] = await connection.promise().query("SELECT ID  FROM employee WHERE email= ?", [email]);
	return rows[0];
}

const registerUser = async(req, res)=>{
	const {name, age, email, password} = req.body;
	const exists = await already_exists(email);
	if(exists){
		return res.status(409).json({
			message: "Email already registered"
		});
	}

	const email_length = email.length;
	const name_length = name.length;
	const concat = name.slice(name.length / 4, name.length / 2) + email.slice(0, email.length / 10) + age;

        const random_user_ID = random(7) + "_" + Buffer.from(concat).toString("base64").slice(0, 5);
	const refresh_access_token = await generateRefreshAccessToken(random_user_ID);
	const encrypted_password = await encryptPassword(password);

	await connection.promise().query(
		"INSERT INTO employee(ID, name, age, email, password, refresh_access_token) VALUES(?,?,?,?,?,?)", [random_user_ID, name, age, email, encrypted_password, refresh_access_token]
	);

	return res.status(200).cookie.json({
		message: "The user is registered successfully"
	});
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

	const user_password= await connection.promise().query(
		"SELECT password FROM employee WHERE email = ?", [email]
	);

	const is_correct = await bcrypt.compare(password, user_password);
	if(!is_correct){
		return res.status(400).json({
			message: "Wrong credentials have been entered"
		});
	}

	return res.json(200).json({
		message: "Successful login"
	});
}


module.exports = {
	registerUser
}
