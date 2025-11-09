const mysql2 = require('mysql2');

// Database configuration - update these with your actual database credentials
const connection = mysql2.createConnection({
	host: process.env.DB_HOST || "localhost",
	user: process.env.DB_USER || "root",
	password: process.env.DB_PASSWORD || "",
	database: process.env.DB_NAME || "construction_db"
});

connection.connect(err =>{
	if(err){
		console.log("database could not be connected due to: ", err);
		return;
	}

	console.log("successfully connected to the database, ayayyyyyy");
});

module.exports = connection;

