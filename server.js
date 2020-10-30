const express = require('express')
const cors = require('cors')
const connectToDatabase = require('./config/database')

const app = express()

// CORS Policy
app.use(cors())

// Init Middleware
app.use(express.json({ extended: false }))

// Routes
app.use('/api/register', require('./routes/api/register'))

const PORT = 3001

const init = () => {
	try {
		// Connection to DB
		connectToDatabase()

		// Run the server
		app.listen(PORT, () => {
			console.log(`Server has been running on port ${PORT}`)
		})
	} catch (e) {
		throw new Error('Internal Error', e.message || e)
	}
}

init()
