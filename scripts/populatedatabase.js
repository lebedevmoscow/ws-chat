const User = require('./../models/User')
const connectToDatabase = require('./../config/database')

const populatedatabase = async () => {
	console.log('Populating database')
	try {
		await connectToDatabase()
		const res = await User.deleteMany({})
		console.log('Populating has been successful')
	} catch (e) {
		console.log('Cannot populate database')
	}
}

populatedatabase()
