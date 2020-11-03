const mongoose = require('mongoose')
const config = require('config')

const connectToDatabase = async () => {
	try {
		await mongoose.connect(config.get('DB_CONNECT'), {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
		})
		console.log('Connection to DB has been successful')
	} catch (e) {
		throw new Error('Cannot connect to Database. Error: ', e.message || e)
	}
}

module.exports = connectToDatabase
