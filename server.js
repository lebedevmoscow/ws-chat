const express = require('express')
const cors = require('cors')
const connectToDatabase = require('./config/database')
const http = require('http')
const socketio = require('socket.io')

const server = express()
const app = http.createServer(server)

const io = socketio(app)

let listusers = [[]]

io.on('connection', (client) => {
	let chatuser

	// Users join the chat
	client.on('user_join_the_chat', ({ user }) => {
		client.username = user.username
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
			chatuser = user
			console.log('====== ALL USERS', listusers)
			// Send action to client
			io.emit('connect_user_client_processed', { user, listusers })
		} else {
			io.emit('send_list_of_users', listusers)
		}
	})

	client.on('user_send_mesage', ({ msg, time, username }) => {
		io.emit('user_send_message_processed', {
			msg,
			time,
			username,
		})
	})

	client.on('disconnect', () => {
		if (chatuser && chatuser.username) {
			console.log('A user', chatuser.username, 'disconnected')
			// console.log('charuser', chatuser)
			const newlistusers = [[]]

			const rooms = []
			for (let i = 0; i < listusers.length; i++) {
				if (i !== chatuser.room - 1) {
					// Push whole room
					newlistusers.push(listusers[i])
				} else {
					const index = i
					// listusers[i].length - amount of users in certain room
					const usersinrooms = []
					for (let j = 0; j < listusers[i].length; j++) {
						if (chatuser.username !== listusers[i][j]) {
							usersinrooms.push(listusers[i][j])
						}
					}
					rooms[index] = usersinrooms
				}
			}
			console.log('listusers', listusers)
			listusers = rooms
			console.log('rooms', rooms)
			io.emit('user_disconedted', { chatuser, listusers })
		}
	})
})

// CORS Policy
server.use(cors())

// Init Middleware
server.use(express.json({ extended: false }))

// Routes
server.use('/api/register', require('./routes/api/register'))
server.use('/api/user', require('./routes/api/user'))
server.use('/api/login', require('./routes/api/login'))

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
