import React, { useEffect, useState, useRef } from 'react'
import { Link, Redirect } from 'react-router-dom'
import openSocket from 'socket.io-client'
import { generateId } from './../../utils/randomid'
import { SERVER_BASE_URL } from './../../config'
import moment from 'moment'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'

// Redux
import { connect } from 'react-redux'
import { loadHistory, sendMessage, removeMessage } from './../../actions/chat'

import './Chat.sass'

// Open up socket for listeting
let socket

const Chat = ({ loadHistory, sendMessage, removeMessage, chat, user }) => {
	// Entered message
	const [msg, setMsg] = useState('')

	const [chatHistory, setChatHistory] = useState({
		message: [],
		user: [],
		time: [],
		id: [],
	})
	const [users, setUsers] = useState([])
	const chatRef = useRef(null)

	// Handlers
	const onDeleteMessageHandler = (id) => {
		if (!id) {
			return toast.error(
				'You cannot delete notification about connect / disconnect',
				{
					position: 'top-right',
					autoClose: 3000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
				}
			)
		}
		socket.emit('user_delete_message', { username: user.username, id })
		return removeMessage(id)
	}

	const onMessageClickHandler = (e, id) => {
		const owner = e.currentTarget.querySelector('span').innerHTML
		if (owner === user.username) {
			if (
				e.currentTarget.classList[
					e.currentTarget.classList.length - 1
				] === 'iconset'
			) {
				e.currentTarget.querySelector('.icons').style.display = 'none'
				return e.currentTarget.classList.remove('iconset')
			} else {
				e.currentTarget.querySelector('.icons').style.display = 'block'
				return e.currentTarget.classList.add('iconset')
			}
		}
	}

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
		const r = await sendMessage(msg, user.room, user.username)
		const id = r.response.id
		socket.emit('user_send_mesage', {
			msg,
			time,
			username: user.username,
			room: user.room,
			id,
		})
		if (window.innerWidth >= 470) {
			chatRef.current.scrollIntoView()
		}
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
		const arrayofmessages = { message: [], user: [], time: [], id: [] }

		// Load chat history
		if (!chat.loadinghistory) {
			chat.history.messages.forEach((m, i) => {
				const msg = m.messages.message[0].message
				const u = m.messages.message[0].user
				const t = m.messages.message[0].time
				const id = m._id

				arrayofmessages.message[i] = msg
				arrayofmessages.user[i] = u
				arrayofmessages.time[i] = t
				arrayofmessages.id[i] = id
			})

			// Push as the last elements message about user connection
			for (let i = 0; i < chatHistory.message.length; i++) {
				if (chatHistory.message[i]) {
					arrayofmessages.id.push(chatHistory.id[i])
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
						setUsers(lst)
					}
				}
			)

			// When users send message
			socket.on(
				'user_send_message_processed',
				({ msg, time, username, room, id }) => {
					if (user.room === room) {
						const prevchat = { ...chatHistory }
						console.log('prevchat', prevchat)
						prevchat.user.push(username)
						prevchat.time.push(time)
						prevchat.message.push(msg)
						prevchat.id.push(id)
						setChatHistory(prevchat)
					}
				}
			)
			socket.on('user_delete_message_processed', ({ username, id }) => {
				const chatHistoryIdCopy = chatHistory.id.concat()
				const chatHistoryTimeCopy = chatHistory.time.concat()
				const chatHistoryMessageCopy = chatHistory.message.concat()
				const chatHistoryUserCopy = chatHistory.user.concat()

				const newchatHistoryIdCopy = []
				const newchatHistoryTimeCopy = []
				const newchatHistoryMessageCopy = []
				const newchatHistoryUserCopy = []

				for (let i = 0; i < chatHistoryIdCopy.length; i++) {
					if (chatHistoryIdCopy[i] !== id) {
						newchatHistoryIdCopy.push(chatHistoryIdCopy[i])
						newchatHistoryTimeCopy.push(chatHistoryTimeCopy[i])
						newchatHistoryMessageCopy.push(
							chatHistoryMessageCopy[i]
						)
						newchatHistoryUserCopy.push(chatHistoryUserCopy[i])
					}
				}
				console.log('chatHistoryMessageCopy', chatHistoryMessageCopy)
				console.log(
					'newchatHistoryMessageCopy',
					newchatHistoryMessageCopy
				)
				const newChat = {
					message: newchatHistoryMessageCopy,
					user: newchatHistoryUserCopy,
					time: newchatHistoryTimeCopy,
					id: newchatHistoryIdCopy,
				}

				console.log('newChat', newChat)
				setChatHistory(newChat)
			})

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
			socket.off('user_delete_message_processed')
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
		<>
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
							<i className='fas fa-comments'></i> Room:
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
								const id = chatHistory.id[i]
								let classes = 'stranger-message'
								let target
								if (user.username === chatHistory.user[i]) {
									classes = 'mine-message'
								}
								return (
									<div
										className={`message ${classes}`}
										key={id}
										data-id={id}
										onClick={(e) => {
											target = e
											onMessageClickHandler(e, id)
										}}
									>
										<div
											className='icons'
											style={{ display: 'none' }}
										>
											<ul>
												<li>
													<FontAwesomeIcon
														icon={faPen}
													/>
												</li>
												<li>
													<FontAwesomeIcon
														icon={faTrash}
														onClick={() =>
															onDeleteMessageHandler(
																id
															)
														}
													/>
												</li>
											</ul>
										</div>
										<p className='meta'>
											<span>{chatHistory.user[i]}</span> -{' '}
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
			<ToastContainer />
		</>
	)
}

const mapStateToProps = (state) => {
	const { user } = state
	const { chat } = state
	return { user, chat }
}

export default connect(mapStateToProps, {
	sendMessage,
	loadHistory,
	removeMessage,
})(Chat)
