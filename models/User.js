const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
	email: {
		type: String,
		required: true,
	},
	username: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	room: {
		type: Number,
	},
	roomalias: {
		type: String | Number,
	},
})

module.exports = User = mongoose.model('user', userSchema)
