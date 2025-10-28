import "mysql2"

connection = mysql2.createConnection({
	host: "",
	user: "",
	password: "",
	database: ""
});

connection.connect(err =>{
	if(err){
		console.log("database could not be connected due to : " err);
		return;
	}

	console.log("successfully connected to the database, ayayyyyyy");
});

module.exports = connection;

