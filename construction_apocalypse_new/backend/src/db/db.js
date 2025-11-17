const mysql2 = require('mysql2');

const connection = mysql2.createConnection({
	host: process.env.DB_HOST || "localhost",
	user: process.env.DB_USER || "cool_user",
	password: process.env.DB_PASSWORD || "Charger@2006",
	database: process.env.DB_NAME || "construction"
});

connection.connect(err =>{
	if(err){
		console.log("database could not be connected due to: ", err);
		return;
	}

	console.log("successfully connected to the database, ayayyyyyy");
});

module.exports = connection;

