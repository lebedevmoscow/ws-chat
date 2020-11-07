import React, { useEffect, useState, useRef } from 'react'
import { Link, Redirect } from 'react-router-dom'
import openSocket from 'socket.io-client'
import { generateId } from './../../utils/randomid'
import { SERVER_BASE_URL } from './../../config'
import moment from 'moment'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Modal } from '@material-ui/core'

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'

// Redux
import { connect } from 'react-redux'
import {
	loadHistory,
	sendMessage,
	removeMessage,
	editMessage,
} from './../../actions/chat'

import './Chat.sass'

// Open up socket for listeting
let socket

const Chat = ({
	loadHistory,
	sendMessage,
	removeMessage,
	editMessage,
	chat,
	user,
}) => {
	// Entered message
	const [msg, setMsg] = useState('')
	const [openmodal, setOpenmodal] = useState(false)
	const [editmodal, setEditmodal] = useState(null)
	const [idforedit, setIdforedit] = useState(null)

	const [chatHistory, setChatHistory] = useState({
		message: [],
		user: [],
		time: [],
		id: [],
		system: [],
		edited: [],
	})
	const [users, setUsers] = useState([])
	const chatRef = useRef(null)

	// Handlers
	const onEditMessageChangeHandler = (e) => {
		setEditmodal(e.target.value)
	}

	const onDeleteMessageHandler = (id, system) => {
		if (system) {
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
	const editMsg = async (id) => {
		await editMessage(id, editmodal)
		socket.emit('user_edited_message', {
			username: user.username,
			id,
			message: editmodal,
		})
		console.log('da')
		setOpenmodal((prev) => !prev)
	}

	const onEditMessageHandler = (e, message, id, system) => {
		if (system) {
			return toast.error(
				'You cannot edit notification about connect / disconnect',
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
		setIdforedit(id)
		setEditmodal(message)
		setOpenmodal((prev) => !prev)
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

		// Get the payload of action
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
		const arrayofmessages = {
			message: [],
			user: [],
			time: [],
			id: [],
			system: [],
			edited: [],
		}

		// Load chat history
		if (!chat.loadinghistory) {
			chat.history.messages.forEach((m, i) => {
				const msg = m.messages.message[0].message
				const u = m.messages.message[0].user
				const t = m.messages.message[0].time
				const s = m.messages.message[0].system
				const e = m.messages.message[0].edited

				const id = m._id

				arrayofmessages.message[i] = msg
				arrayofmessages.user[i] = u
				arrayofmessages.time[i] = t
				arrayofmessages.system[i] = s
				arrayofmessages.id[i] = id
				arrayofmessages.edited[i] = e
			})

			// Push as the last elements message about user connection
			for (let i = 0; i < chatHistory.message.length; i++) {
				if (chatHistory.message[i]) {
					arrayofmessages.id.push(chatHistory.id[i])
					arrayofmessages.message.push(chatHistory.message[i])
					arrayofmessages.user.push(chatHistory.user[i])
					arrayofmessages.time.push(chatHistory.time[i])
					arrayofmessages.system.push(chatHistory.system[i])
					arrayofmessages.edited.push(chatHistory.edited[i])
				}
			}
		}
		setChatHistory(arrayofmessages)
	}, [chat.loadinghistory])

	useEffect(() => {
		if (socket) {
			socket.on(
				'connect_user_client_processed',
				async ({ u, lst, room, time, system }) => {
					if (room === user.room) {
						console.log('A user', u.username, 'connected the chat')

						setUsers(lst)
						if (user.username !== u.username) {
							toast.success(
								`A ${user.username} connected the chat`,
								{
									position: 'top-right',
									autoClose: 2000,
									hideProgressBar: false,
									closeOnClick: true,
									pauseOnHover: true,
									draggable: true,
									progress: undefined,
								}
							)
						}

						// const prevchat = { ...chatHistory }
						// prevchat.user.push(u.username)
						// prevchat.time.push(time)
						// prevchat.message.push(
						// 	`A user ${u.username} connected the chat`
						// )
						// prevchat.system.push(system)
						// prevchat.edited.push(false)
						// setChatHistory(prevchat)

						// List of users
					}
				}
			)

			// When users disconnect
			socket.on(
				'user_disconedted',
				async ({ usernameinroom, lst, time, room }) => {
					if (user.room === room) {
						if (usernameinroom !== user.username) {
							toast.error(
								`A ${usernameinroom} disconneted the chat`,
								{
									position: 'top-right',
									autoClose: 2000,
									hideProgressBar: false,
									closeOnClick: true,
									pauseOnHover: true,
									draggable: true,
									progress: undefined,
								}
							)
						}

						// const prevchat = { ...chatHistory }
						// prevchat.user.push(usernameinroom)
						// prevchat.time.push(time)
						// prevchat.message.push(
						// 	`A user ${usernameinroom} disconnected the chat`
						// )
						// prevchat.system.push(false)
						// prevchat.edited.push(false)
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
						prevchat.system.push(false)
						prevchat.edited.push(false)
						setChatHistory(prevchat)
					}
				}
			)

			socket.on(
				'user_edited_message_processed',
				({ username, id, message }) => {
					console.log('chat', chatHistory.message)
					const chatHistoryIdCopy = chatHistory.id.concat()
					const chatHistoryTimeCopy = chatHistory.time.concat()
					const chatHistoryMessageCopy = chatHistory.message.concat()
					const chatHistoryUserCopy = chatHistory.user.concat()
					const chatHistorySystemCopy = chatHistory.system.concat()
					const chatHistoryEditedCopy = chatHistory.edited.concat()

					const newchatHistoryIdCopy = []
					const newchatHistoryTimeCopy = []
					const newchatHistoryMessageCopy = []
					const newchatHistoryUserCopy = []
					const newchatHistorySystemCopy = []
					const newchatHistoryEditedCopy = []

					for (let i = 0; i < chatHistoryIdCopy.length; i++) {
						if (chatHistoryIdCopy[i] !== id) {
							newchatHistoryIdCopy.push(chatHistoryIdCopy[i])
							newchatHistoryTimeCopy.push(chatHistoryTimeCopy[i])
							newchatHistoryMessageCopy.push(
								chatHistoryMessageCopy[i]
							)
							newchatHistoryUserCopy.push(chatHistoryUserCopy[i])
							newchatHistorySystemCopy.push(
								chatHistorySystemCopy[i]
							)
							newchatHistoryEditedCopy.push(
								chatHistoryEditedCopy[i]
							)
						} else {
							newchatHistoryIdCopy.push(chatHistoryIdCopy[i])
							newchatHistoryTimeCopy.push(chatHistoryTimeCopy[i])
							newchatHistoryMessageCopy.push(message)
							newchatHistoryUserCopy.push(chatHistoryUserCopy[i])
							newchatHistorySystemCopy.push(
								chatHistorySystemCopy[i]
							)
							newchatHistoryEditedCopy.push(true)
						}
					}

					const newChat = {
						message: newchatHistoryMessageCopy,
						user: newchatHistoryUserCopy,
						time: newchatHistoryTimeCopy,
						id: newchatHistoryIdCopy,
						system: newchatHistorySystemCopy,
						edited: newchatHistoryEditedCopy,
					}

					setChatHistory(newChat)
				}
			)

			socket.on('user_delete_message_processed', ({ username, id }) => {
				// It could be not best example of code but it works
				// To be honest i made this piece of shit just for
				// avoid unnecessary mutations (if it works like i think)

				// Create a new copy of chat
				const chatHistoryIdCopy = chatHistory.id.concat()
				const chatHistoryTimeCopy = chatHistory.time.concat()
				const chatHistoryMessageCopy = chatHistory.message.concat()
				const chatHistoryUserCopy = chatHistory.user.concat()
				const chatHistorySystemCopy = chatHistory.system.concat()
				const chatHistoryEditedCopy = chatHistory.edited.concat()

				const newchatHistoryIdCopy = []
				const newchatHistoryTimeCopy = []
				const newchatHistoryMessageCopy = []
				const newchatHistoryUserCopy = []
				const newchatHistorySystemCopy = []
				const newchatHistoryEditedCopy = []

				for (let i = 0; i < chatHistoryIdCopy.length; i++) {
					if (chatHistoryIdCopy[i] !== id) {
						newchatHistoryIdCopy.push(chatHistoryIdCopy[i])
						newchatHistoryTimeCopy.push(chatHistoryTimeCopy[i])
						newchatHistoryMessageCopy.push(
							chatHistoryMessageCopy[i]
						)
						newchatHistoryUserCopy.push(chatHistoryUserCopy[i])
						newchatHistorySystemCopy.push(chatHistorySystemCopy[i])
						newchatHistoryEditedCopy.push(chatHistoryEditedCopy[i])
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
					system: newchatHistorySystemCopy,
					edited: newchatHistoryEditedCopy,
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
			socket.off('user_edited_message_processed')
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

	const modalbody = (
		<div className='editmodal'>
			<h2 id='simple-modal-title'>Message Editing </h2>
			<p className='editmodal__username'>
				<span>твоя улиточка</span> - Nov 7, 2020 4:57 PM
			</p>
			<textarea
				value={editmodal}
				onChange={onEditMessageChangeHandler}
			></textarea>
			<div className='editmodal__buttons'>
				<button
					className='btn btn-edit'
					onClick={() => {
						editMsg(idforedit, editmodal)
					}}
				>
					Edit
				</button>
				<button
					className='btn cancel-edit'
					onClick={() => setOpenmodal(false)}
				>
					Cancel
				</button>
			</div>
		</div>
	)

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
								const system = chatHistory.system[i]
								const edited = chatHistory.edited[i]
								let classes = 'stranger-message'

								if (user.username === chatHistory.user[i]) {
									classes = 'mine-message'
								}
								edited
									? (classes += ' edited')
									: (classes += ' non-edited')
								return (
									<div
										className={`message ${classes}`}
										key={id}
										data-id={id}
										onClick={(e) => {
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
														onClick={(e) =>
															onEditMessageHandler(
																e,
																m,
																id,
																system
															)
														}
													/>
												</li>
												<li>
													<FontAwesomeIcon
														icon={faTrash}
														onClick={() =>
															onDeleteMessageHandler(
																id,
																system
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
										<h6>Edited</h6>
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
			<Modal
				open={openmodal}
				onClose={onEditMessageHandler}
				aria-labelledby='simple-modal-title'
				aria-describedby='simple-modal-description'
			>
				{modalbody}
			</Modal>
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
	editMessage,
})(Chat)
