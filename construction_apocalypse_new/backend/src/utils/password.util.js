const bcrypt = require('bcrypt');

const encryptPassword = async(password)=>{
	const saltRounds = 10;
	try{
		const hash = await bcrypt.hash(password, saltRounds);
		return hash;
	}
	catch(error){
		console.log(error);
		throw error;
	}
}

const comparePassword = async(password, encrypted)=>{
	const enc = encryptPassword(password);
	return (enc == encrypted);
}



module.exports = {
	encryptPassword,
	comparePassword
};
