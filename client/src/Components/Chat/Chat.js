import React, { useEffect, useState, useRef } from 'react'
import { Link, Redirect } from 'react-router-dom'
import openSocket from 'socket.io-client'
import { generateId } from './../../utils/randomid'

import moment from 'moment'

// Redux
import { useSelector } from 'react-redux'

// Open up socket for listeting
let socket

if (socket) {
	console.log('dadada')
} else console.log('netnetnet')

const Chat = () => {
	// Entered message
	const [msg, setMsg] = useState('')

	const [chat, setChat] = useState({
		message: [],
		user: [],
		time: [],
	})
	const [users, setUsers] = useState([])

	const chatRef = useRef(null)

	const user = useSelector((state) => state.user)

	const onChangeHandler = (e) => {
		setMsg(e.target.value)
	}

	const onLogOutHandler = (e) => {
		e.preventDefault()
		socket.disconnect()
	}
	useEffect(() => {
		socket = openSocket('http://localhost:3001')
		// Notify server about connection
		if (user.username) {
			socket.emit('user_join_the_chat', { user })
		}
		// Get result from server
		socket.on('connect_user_client_processed', ({ user, listusers }) => {
			console.log('user', user)
			console.log('A user', user.username, 'connected the chat')
			// List of users
			console.log('uesrs', listusers)
			setUsers(listusers[user.room - 1])
		})
		// When users send message
		socket.on('user_send_message_processed', ({ msg, time, username }) => {
			console.log('msg', msg)
			console.log('time', time)
			console.log('username', username)
			const prevchat = { ...chat }
			prevchat.user.push(username)
			prevchat.time.push(time)
			prevchat.message.push(msg)
			setChat(prevchat)
			console.log('new message: ', msg)
		})
		// If this is the same user
		socket.on('send_list_of_users', (listusers) => {
			setUsers(listusers)
		})
		// When users disconnect
		socket.on('user_disconedted', ({ chatuser, listusers }) => {
			console.log(chatuser, 'disconnected')
			setUsers(listusers)
		})
		// Clean up
		return () => {
			socket.off('connect_user_client_processed')
			socket.off('user_send_message_processed')
			socket.off('send_list_of_users')
			socket.off('user_disconedted')
		}
	}, [user])

	// To scroll down when submit the message
	useEffect(() => {
		chatRef && chatRef.current && chatRef.current.scrollIntoView()
	}, [chat])

	const onSubmitHandler = (e) => {
		e.preventDefault()
		setMsg('')
		const time = moment().format('lll')
		socket.emit('user_send_mesage', { msg, time, username: user.username })
		chatRef.current.scrollIntoView()
	}

	// PAGE AVIABLE ONLY FOR AUTHENTICATED USERS
	const isRegistered = localStorage.getItem('user')
	if (!isRegistered && !user.loading) {
		return <Redirect to='/' />
	}

	if (!user.room) {
		return <Redirect to='/' />
	}

	return (
		<div className='chat-container'>
			<header className='chat-header'>
				<h1>
					<i className='fas fa-smile'></i> Chat by Boris Lebedev
				</h1>
				<button className='btn' onClick={onLogOutHandler}>
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
					<h2 id='room-name'>{user.room}</h2>
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
					{chat &&
						chat.message &&
						chat.message.map((m, i) => {
							const id = generateId()
							return (
								<div className='message' key={id}>
									<p className='meta'>
										{chat.user[i]} - {chat.time[i]}
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
				<form id='chat-form'>
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

export default Chat
