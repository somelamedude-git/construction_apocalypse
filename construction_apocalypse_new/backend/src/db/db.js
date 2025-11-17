const mysql2 = require('mysql2');
require('dotenv').config('../.env');

const connection = mysql2.createConnection({
	host: process.env.MYSQLHOST,
	user: process.env.MYSQLUSER,
	password: process.env.MYSQLPASSWORD,
	database: process.env.MYSQLDATABASE,
	port: process.env.MYSQLPORT
});

connection.connect(err =>{
	if(err){
		console.log("database could not be connected due to: ", err);
		return;
	}

	console.log("successfully connected to the database, ayayyyyyy");
});

module.exports = connection;

