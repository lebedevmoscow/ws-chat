const express = require('express')
const app = express()
const server = require('http').createServer(app)
const connectToDatabase = require('./config/database')
const io = require('socket.io')(server)
const cors = require('cors')
const moment = require('moment')

let listusers = [[]]
let listids = [[]]

io.on('connection', (client) => {
	// Users join the chat
	client.on('user_join_the_chat', ({ user, time }) => {
		// Create empty room is itself is not defined
		if (!listusers[user.room - 1]) {
			listusers[user.room - 1] = []
		}
		if (!listids[user.room - 1]) {
			listids[user.room - 1] = []
		}

		// Notify about it in the console
		console.log('A user', user.username, 'connected to room', user.room)

		// Put this user in his room
		const roomname = `room${user.room}`
		client.join(roomname)

		if (!listusers[user.room - 1].find((u) => u == user.username)) {
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

			const lst = listusers[user.room - 1]
			// Send action to client
			io.emit('connect_user_client_processed', {
				u: user,
				lst,
				room: user.room,
				time,
				system: true,
			})
		} else {
			io.emit('send_list_of_users', listusers[user.room - 1])
		}
	})

	client.on('user_edited_message', ({ username, id, message }) => {
		console.log(`${username} edited message with id ${id}`)
		io.emit('user_edited_message_processed', { username, id, message })
	})

	client.on('user_delete_message', ({ username, id }) => {
		console.log(`${username} deleting message with id ${id}`)
		io.emit('user_delete_message_processed', { username, id })
	})

	client.on('user_send_mesage', ({ msg, time, username, room, id }) => {
		console.log('id sent message', client.id)
		io.emit('user_send_message_processed', {
			msg,
			time,
			username,
			room,
			id,
		})
	})

	client.on('disconnect', () => {
		// Get the username by client id
		let userroomnumber = -1
		let indexinroom = -1
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

		if (userroomnumber !== -1 && indexinroom !== -1) {
			// Get username by socketid
			const usernameinroom = listusers[userroomnumber][indexinroom]

			const newlistids = [[]]
			const newlistusers = [[]]

			// I know this is fucking magic code and it can be write a lot of better =/

			// Update userlist
			for (let i = 0; i < listusers.length; i++) {
				if (i !== userroomnumber) {
					// Push whole room
					const acpy1 = listusers[i].concat()
					const acpy2 = listids[i].concat()

					newlistusers[i] = acpy1
					newlistids[i] = acpy2
				} else {
					// listusers[i].length - amount of users in certain room
					const usersinrooms = []
					const idsinrooms = []
					for (let j = 0; j < listusers[i].length; j++) {
						if (usernameinroom !== listusers[i][j]) {
							usersinrooms.push(listusers[i][j])
						}
						if (client.id !== listids[i][j]) {
							idsinrooms.push(listids[i][j])
						}
					}
					newlistusers[i] = usersinrooms
					newlistids[i] = idsinrooms
				}
			}

			listusers = newlistusers
			listids = newlistids

			const lst = listusers[userroomnumber]

			console.log(usernameinroom, 'disconnected')

			const time = moment().format('lll')
			io.emit('user_disconedted', {
				usernameinroom,
				lst,
				time,
				room: userroomnumber + 1,
			})
		}
	})
})

// CORS Policy
app.use(cors())

// Init Middleware
app.use(express.json({ extended: false }))

// Static files
if (process.env.NODE_ENV === 'production') {
	app.use(express.static('client/build'))
}

// Routes
app.use('/api/register', require('./routes/api/register'))
app.use('/api/user', require('./routes/api/user'))
app.use('/api/login', require('./routes/api/login'))
app.use('/api/chat', require('./routes/api/chat'))

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
