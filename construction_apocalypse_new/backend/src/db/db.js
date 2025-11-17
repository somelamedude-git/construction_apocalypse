const mysql2 = require('mysql2');
require('dotenv').config('../.env');

// Use createPool for better performance in production (handles multiple connections)
const connection = mysql2.createPool({
	host: process.env.MYSQLHOST,
	user: process.env.MYSQLUSER,
	password: process.env.MYSQLPASSWORD,
	database: process.env.MYSQLDATABASE,
	port: process.env.MYSQLPORT || 3306,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});

// Test the connection
connection.getConnection((err, conn) => {
	if(err){
		console.log("database could not be connected due to: ", err);
		return;
	}
	console.log("successfully connected to the database, ayayyyyyy");
	conn.release(); // Release the connection back to the pool
});

// Export the pool (code uses connection.promise().query() which works with pools)
module.exports = connection;

