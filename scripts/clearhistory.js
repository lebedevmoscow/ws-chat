const Chat = require('./../models/Chat')
const connectToDatabase = require('./../config/database')

const populatedatabase = async () => {
	console.log('Clearing chat history')
	try {
		await connectToDatabase()
		const res = await Chat.deleteMany({})
		console.log('Cleaning chat history has been successful')
	} catch (e) {
		console.log('Cannot clear chat history')
	}
}

populatedatabase()
