const express = require('express')
const bcrypt = require('bcrypt')
const config = require('config')
const { body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')

const router = express.Router()

// Models
const User = require('./../../models/User')

router.post(
	'/',
	[body('email').isEmail(), body('password').isLength({ min: 2 })],
	async (req, res) => {
		const secretWord = config.get('SECRET_WORD')
		const hashedPassword = await bcrypt.hash(req.body.password, 10)

		try {
			// Check on errors by express-validator
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({
					status: 400,
					msg: 'Errors in regestration form',
					errors: errors.array(),
				})
			}

			// Check if user with this email already exists
			const candidate1 = await User.findOne({ email: req.body.email })
			const candidate2 = await User.findOne({
				username: req.body.username,
			})

			if (candidate1) {
				return res.status(400).json({
					status: '409',
					msg: 'There is already exist such a user',
				})
			}

			if (candidate2) {
				return res.status(400).json({
					status: '409',
					msg: 'There is alreay exist user with such',
				})
			}

			// Register a new user
			const user = await new User({
				email: req.body.email,
				password: hashedPassword,
				username: req.body.username,
			})

			await user.save()

			// Create a JWT
			const token = jwt.sign(
				{
					user: {
						email: req.body.email,
						password: hashedPassword,
						user_id: user._id,
						username: req.body.username,
					},
				},
				config.get('SECRET_WORD'),
				{
					expiresIn: '128h',
				}
			)

			return res.status(200).json({
				status: '200',
				id: user._id,
				msg: 'Regestration has been successful',
				user: {
					username: req.body.username,
					password: hashedPassword,
					email: req.body.email,
					room: null,
				},
				token,
			})
		} catch (e) {
			console.log('Registration Fail. Error: ', e.message || e)
			return res
				.status(500)
				.send('Registration Fail. Error: ', e.message || e)
		}
	}
)

module.exports = router
