const express = require('express')
const User = require('../../models/User')
const auth = require('./../../middleware/auth')

const router = express.Router()

// Get User Data
router.post('/', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.user_id)
		return res.status(200).json({ user })
	} catch (e) {
		console.log('Error in User Route in API', e.message || e)
		return res.status(400).json({ msg: 'Error in User Route in API' })
	}
})

router.post('/changeroom', auth, async (req, res) => {
	console.log('changing room', req.body.room, req.body.alias)
	try {
		const user = req.user
		await User.findOneAndUpdate(user.user_id, {
			room: req.body.room,
			roomalias: req.body.alias,
		})
		return res.status(200).json({ msg: 'OK' })
	} catch (e) {
		console.log('Cannot Update Room In to database: e', e.message || e)
		return res.status(500)
	}
})

module.exports = router
