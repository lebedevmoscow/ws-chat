import React, { useEffect, useState, useRef } from 'react'
import { Link, Redirect } from 'react-router-dom'
import openSocket from 'socket.io-client'
import { generateId } from './../../utils/randomid'

import { SERVER_BASE_URL } from './../../config'

import moment from 'moment'

// Redux
import { connect } from 'react-redux'
import { loadHistory, sendMessage } from './../../actions/chat'

import './Chat.sass'

// Open up socket for listeting
let socket

const Chat = ({ loadHistory, sendMessage, chat, user }) => {
	// Entered message
	const [msg, setMsg] = useState('')

	const [chatHistory, setChatHistory] = useState({
		message: [],
		user: [],
		time: [],
	})
	const [users, setUsers] = useState([])
	const chatRef = useRef(null)

	// Handlers
	const onChangeHandler = (e) => {
		e.preventDefault()
		setMsg(e.target.value)
	}

	const onLogOutHandler = (e) => {
		e.preventDefault()
		socket.disconnect()
	}

	const onSubmitHandler = async (e) => {
		e.preventDefault()
		if (msg === '') return
		setMsg('')
		const time = moment().format('lll')
		socket.emit('user_send_mesage', {
			msg,
			time,
			username: user.username,
			room: user.room,
		})
		if (window.innerWidth >= 470) {
			chatRef.current.scrollIntoView()
		}
		await sendMessage(msg, user.room, user.username)
	}

	// Use Effects

	useEffect(() => {
		socket = openSocket(SERVER_BASE_URL)
	}, [])

	useEffect(() => {
		loadHistory(user.room)
		// Notify server about connection
		if (!user.loading) {
			const time = moment().format('lll')
			socket.emit('user_join_the_chat', { user, time })
		}
	}, [user, loadHistory])

	useEffect(() => {
		chatRef && chatRef.current && chatRef.current.scrollIntoView()
	})

	useEffect(() => {
		const arrayofmessages = { message: [], user: [], time: [] }

		// Load chat history
		if (!chat.loadinghistory) {
			chat.history.messages.forEach((m, i) => {
				const msg = m.messages.message[0].message
				const u = m.messages.message[0].user
				const t = m.messages.message[0].time
				arrayofmessages.message[i] = msg
				arrayofmessages.user[i] = u
				arrayofmessages.time[i] = t
			})

			// Push as the last elements message about user connection
			for (let i = 0; i < chatHistory.message.length; i++) {
				if (chatHistory.message[i]) {
					arrayofmessages.message.push(chatHistory.message[i])
					arrayofmessages.user.push(chatHistory.user[i])
					arrayofmessages.time.push(chatHistory.time[i])
				}
			}
		}
		setChatHistory(arrayofmessages)
	}, [chat.loadinghistory])

	useEffect(() => {
		if (socket) {
			socket.on(
				'connect_user_client_processed',
				async ({ u, lst, room, time }) => {
					if (room === user.room) {
						console.log('A user', u.username, 'connected the chat')
						const prevchat = { ...chatHistory }

						console.log('==PREV', prevchat)

						prevchat.user.push(u.username)
						prevchat.time.push(time)
						prevchat.message.push(
							`A user ${u.username} connected the chat`
						)
						// await sendMessage(
						// 	`A user ${user.username} connected the chat`,
						// 	user.room,
						// 	user.username
						// )
						setChatHistory(prevchat)

						// List of users
						setUsers(lst)
					}
				}
			)

			// When users disconnect
			socket.on(
				'user_disconedted',
				async ({ usernameinroom, lst, time, room }) => {
					if (user.room === room) {
						const prevchat = { ...chatHistory }
						prevchat.user.push(usernameinroom)
						prevchat.time.push(time)
						prevchat.message.push(
							`A user ${usernameinroom} disconnected the chat`
						)
						// await sendMessage(
						// 	`A user ${user.username} disconnected the chat`,
						// 	user.room,
						// 	user.username
						// )
						setUsers(lst)
					}
				}
			)

			// When users send message
			socket.on(
				'user_send_message_processed',
				({ msg, time, username, room }) => {
					if (user.room === room) {
						const prevchat = { ...chatHistory }
						console.log('prevchat', prevchat)
						prevchat.user.push(username)
						prevchat.time.push(time)
						prevchat.message.push(msg)
						setChatHistory(prevchat)
					}
				}
			)
			// If this is the same user
			socket.on('send_list_of_users', (listusers) => {
				setUsers(listusers)
			})
		}

		// Clean up
		return () => {
			socket.off('connect_user_client_processed')
			socket.off('user_send_message_processed')
			socket.off('send_list_of_users')
			socket.off('user_disconedted')
		}
	})

	// Security
	const isRegistered = localStorage.getItem('user')
	if (!isRegistered && !user.loading) {
		return <Redirect to='/register' />
	}

	if (!user.room) {
		return <Redirect to='/' />
	}

	// Loading state
	if (chat.loadinghistory) {
		return <h1>Loading...</h1>
	}

	return (
		<div className='chat-container'>
			<header className='chat-header'>
				<h1 className='chat-welcometext'>
					<i className='fas fa-smile'></i> Chat by Boris Lebedev
				</h1>
				<button className='btn leave-btn' onClick={onLogOutHandler}>
					<Link className='btn' to='/'>
						Leave Room
					</Link>
				</button>
			</header>
			<main className='chat-main'>
				<div className='chat-sidebar'>
					<h3>
						<i className='fas fa-comments'></i> Room number:
					</h3>
					<h2 id='room-name'>{user.roomalias}</h2>
					<h3>
						<i className='fas fa-users'></i> Users
					</h3>
					<ul id='users'>
						{users &&
							users.map((user) => {
								const id = generateId()
								return <li key={id}>{user}</li>
							})}
					</ul>
				</div>
				<div className='chat-messages'>
					{chatHistory &&
						chatHistory.message &&
						chatHistory.message.map((m, i) => {
							const id = generateId()
							let classes = 'stranger-message'
							if (user.username === chatHistory.user[i]) {
								classes = 'mine-message'
							}
							return (
								<div className={`message ${classes}`} key={id}>
									<p className='meta'>
										{chatHistory.user[i]} -{' '}
										{chatHistory.time[i]}
									</p>
									<p className='text'>{m}</p>
								</div>
							)
						})}
					<div
						style={{
							float: 'left',
							clear: 'both',
							paddingTop: 20,
						}}
						ref={chatRef}
					></div>
				</div>
			</main>
			<div className='chat-form-container'>
				<form id='chat-form' className='chat-form'>
					<input
						id='msg'
						type='text'
						placeholder='Enter Message'
						value={msg}
						onChange={(e) => onChangeHandler(e)}
					/>
					<button onClick={onSubmitHandler} className='btn'>
						<i className='fas fa-paper-plane'></i> Send
					</button>
				</form>
			</div>
		</div>
	)
}

const mapStateToProps = (state) => {
	const { user } = state
	const { chat } = state
	return { user, chat }
}

export default connect(mapStateToProps, { sendMessage, loadHistory })(Chat)
