const express = require('express')
const Chat = require('./../../models/Chat')
const moment = require('moment')
const auth = require('./../../middleware/auth')

const router = express.Router()

router.post('/newmessage', auth, async (req, res) => {
	const message = req.body.message
	const room = req.body.room
	const username = req.body.username

	try {
		const time = moment().format('lll')
		const chat = new Chat({
			room: room,
			messages: {
				message: {
					user: username,
					time,
					message,
				},
			},
		})
		const id = chat._id
		await chat.save()

		return res.status(200).json({
			msg: 'OK',
			response: { user: username, time, message, id },
		})
	} catch (e) {
		console.log('Cannot update Chat Model', e.message || e)
		return res.status(400).json({ msg: e.message || e })
	}
})

router.post('/loadhistory', auth, async (req, res) => {
	const room = req.body.room
	try {
		const result = await Chat.find({ room })
		return res.status(200).json({ messages: result })
	} catch (e) {
		console.log('Cannot load history', e.message || e)
		return res.status(400).json({ msg: 'Cannot load history' })
	}
})

router.post('/deletemessage', auth, async (req, res) => {
	const id = req.body.id
	try {
		const result = await Chat.deleteOne({ _id: id })
		return res.status(200).json({ message: result })
	} catch (e) {
		console.log('Cannot delete message', e.message || e)
		return res.status(400).json({ msg: 'Cannot delete message' })
	}
})

module.exports = router
