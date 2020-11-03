const jwt = require('jsonwebtoken')
const config = require('config')
const User = require('./../models/User')

module.exports = async (req, res, next) => {
	// Get Token from header
	const token = req.header('x-auth-token')

	// If token is not exist or not valid
	if (!token) {
		return res
			.status(401)
			.json({ status: 401, error: 'No error, auth denied' })
	}

	try {
		const decodedJwt = jwt.verify(token, config.get('SECRET_WORD'))
		const user = await User.findById(decodedJwt.user.user_id)
		req.user = decodedJwt.user
		req.token = token

		next()
	} catch (e) {
		return res
			.status(401)
			.json({ status: 401, error: 'Token is not valid' })
	}
}
