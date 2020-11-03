const User = require('./../models/User')

const removeUsers = async () => {
	try {
		const res = await User.deleteMany({})
		console.log('res', res)
		console.log('Users has been deleted')
	} catch (e) {
		console.log('Error while clearing database', e.message || e)
	}
}

removeUsers()
