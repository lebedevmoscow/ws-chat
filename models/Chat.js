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
				edited: {
					type: Boolean,
					required: true,
				},
				system: {
					type: Boolean,
					required: false,
				},
			},
		],
	},
})

module.exports = Chat = mongoose.model('chat', chatSchema)
