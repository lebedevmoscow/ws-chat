const mongoose = require('mongoose')

const chatSchema = mongoose.Schema({
	room: {
		type: Number,
	},
	messages: {
		message: [
			{
				user: {
					type: String,
					required: true,
				},
				time: {
					type: String,
					required: true,
				},
				message: {
					type: String,
					required: true,
				},
			},
		],
	},
})

module.exports = Chat = mongoose.model('chat', chatSchema)
