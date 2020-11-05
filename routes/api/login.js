const express = require('express')
const bcrypt = require('bcrypt')
const User = require('./../../models/User')
const jwt = require('jsonwebtoken')
const config = require('config')

const router = express.Router()

router.post('/', async (req, res) => {
	console.log('login')
	try {
		const { password, email } = req.body

		try {
			const candidate = await User.findOne({ email })
			console.log('email', email)

			if (candidate) {
				const r = await bcrypt.compare(password, candidate.password)
				if (r) {
					console.log('if r', r)
					const jwttoken = jwt.sign(
						{
							user: {
								email: candidate.email,
								password: candidate.password,
								user_id: candidate._id,
								username: candidate.username,
							},
						},
						config.get('SECRET_WORD'),
						{
							expiresIn: '128h',
						}
					)
					return res.status(200).json({
						msg: 'OK',
						user: candidate,
						status: 200,
						token: jwttoken,
					})
				}
			} else {
				return res
					.status(409)
					.json({ msg: 'User not found', status: 409 })
			}
		} catch (e) {
			console.log('Cannot Loggin', e.message || e)
			return res.status(409).json({ msg: 'User not found', status: 409 })
		}
	} catch (e) {
		console.log('Cannot Log In', e.message || e)
		return res.status(409).json({ msg: 'Invalid credentials', status: 409 })
	}
})

module.exports = router
