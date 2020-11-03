const express = require('express')
const app = express()
const path = require('path')
const server = require('http').createServer(app)
const connectToDatabase = require('./config/database')
const io = require('socket.io')(server)
const cors = require('cors')

let listusers = [[]]
let listids = [[]]

io.on('connection', (client) => {
	console.log('connect', client.id)
	// Users join the chat
	client.on('user_join_the_chat', ({ user }) => {
		// Create empty room is itself is not defined
		if (!listusers[user.room - 1]) {
			listusers[user.room - 1] = []
		}
		if (!listids[user.room - 1]) {
			listids[user.room - 1] = []
		}

		// Notify abouut it in the console
		console.log('A user', user.username, 'connected to room', user.room)

		// Put this user in his room
		const roomname = `room${user.room}`
		client.join(roomname)

		if (!listusers[user.room - 1].find((u) => u == user.username)) {
			console.log('===== PREV USERS NOT FOUND')

			if (!listusers[user.room - 1]) {
				listusers[user.room - 1] = [user.username]
			} else {
				listusers[user.room - 1].push(user.username)
			}

			if (!listids[user.room - 1]) {
				listids[user.room - 1] = [client.id]
			} else {
				listids[user.room - 1].push(client.id)
			}

			chatuser = user
			console.log('====== ALL USERS', listusers)
			console.log('====== ALL IDS', listids)
			// Send action to client
			io.emit('connect_user_client_processed', { user, listusers })
		} else {
			io.emit('send_list_of_users', listusers)
		}
	})

	client.on('user_send_mesage', ({ msg, time, username }) => {
		console.log('id sent message', client.id)
		io.emit('user_send_message_processed', {
			msg,
			time,
			username,
		})
	})

	client.on('reconnect', () => {
		console.log('reconnect')
	})

	client.on('disconnect', (args) => {
		// Get the username by client id
		let userroomnumber
		let indexinroom
		console.log('id', client.id)
		// Go throught rooms
		for (let i = 0; i < listids.length; i++) {
			// Go throuth users in this room
			for (let j = 0; j < listids[i].length; j++) {
				// If we found the right user
				if (listids[i][j] === client.id) {
					userroomnumber = i
					indexinroom = j
				}
			}
		}
		// Get username by socketid
		const usernameinroom = listids[userroomnumber][indexinroom]
		console.log('A user', usernameinroom, 'disconnected')
		const newlistusers = [[]]
		const rooms = []
		for (let i = 0; i < listusers.length; i++) {
			if (i !== userroomnumber) {
				// Push whole room
				newlistusers.push(listusers[i])
			} else {
				const index = i
				// listusers[i].length - amount of users in certain room
				const usersinrooms = []
				for (let j = 0; j < listusers[i].length; j++) {
					if (usernameinroom !== listusers[i][j]) {
						usersinrooms.push(listusers[i][j])
					}
				}
				rooms[index] = usersinrooms
			}
		}
		console.log('listusers', listusers)
		listusers = rooms
		console.log('rooms', rooms)
		io.emit('user_disconedted', { usernameinroom, listusers })
	})
})

// CORS Policy
app.use(cors())

// Init Middleware
app.use(express.json({ extended: false }))

// Static files
app.use(express.static(path.join(__dirname, 'client', 'public')))

// Routes
app.use('/api/register', require('./routes/api/register'))
app.use('/api/user', require('./routes/api/user'))
app.use('/api/login', require('./routes/api/login'))

const PORT = 3001

const init = async () => {
	try {
		// Connection to DB
		await connectToDatabase()

		// Run the server
		server.listen(PORT, () => {
			console.log(`Server has been running on port ${PORT}`)
		})
	} catch (e) {
		throw new Error('Internal Error', e.message || e)
	}
}

init()
