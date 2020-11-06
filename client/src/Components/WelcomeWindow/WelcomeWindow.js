import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'

import './WelcomeWindow.sass'
import './../../style.css'

// Redux
import { useSelector, connect } from 'react-redux'
import { loadUserData, changeUserRoom } from './../../actions/user'

const WelcomeWindow = ({ changeUserRoom }) => {
	// User data
	const user = useSelector((state) => state.user)

	// By default selected room is 1
	const [selectedRoom, setSelectedRoom] = useState({
		room: 1,
		alias: 'горячие любовнички',
	})

	// When need to redirect the user
	const [redirect, setRedirect] = useState(null)
	const [redirectLogout, setRedirectLogOut] = useState(null)

	useEffect(() => {
		// Load the data to print the name in the modal window
		if (!user.username) {
			loadUserData()
		}
	}, [user])

	// If loading return spinner
	if (user.loading) {
		return <h1>Loading...</h1>
	}

	// If user wants change the default room
	const onChangeHandler = (e) => {
		const alias = e.target.querySelectorAll('option')[e.target.value - 1]
			.dataset.alias
		const room = parseInt(e.target.value, 10)
		const obj = { room, alias }
		setSelectedRoom(obj)
	}

	// Send request on database that we want change the room
	const onSubmitHandler = async (e) => {
		e.preventDefault()
		await changeUserRoom(selectedRoom.room, selectedRoom.alias)
		setRedirect(true)
	}

	// Sign Out Handler
	const onExitHandler = (e) => {
		e.preventDefault()
		localStorage.removeItem('registered')
		localStorage.removeItem('user')
		setRedirectLogOut(true)
	}

	if (redirect) {
		return <Redirect to='/chat' />
	}

	if (redirectLogout) {
		return <Redirect to='/' />
	}

	if (!localStorage.getItem('user') && !localStorage.getItem('registered')) {
		return <Redirect to='/register' />
	}

	return (
		<div className='join-container'>
			<header className='join-header'>
				<h1>
					<i className='fas fa-smile'></i> Chat by Boris Lebedev
				</h1>
			</header>
			<main className='join-main'>
				<form action='chat.html'>
					<div className='form-control'>
						<h1 className='join-username'>
							Welcome, {user.username}
						</h1>
					</div>
					<div className='form-control'>
						<label>Choise room where you want to join</label>
						<select
							name='room'
							id='room'
							onChange={onChangeHandler}
						>
							<option value='1' data-alias='горячие любовнички'>
								горячие любовнички
							</option>
							<option value='2' data-alias='мощный s3x'>
								мощный s3x
							</option>
						</select>
					</div>
					<button className='btn' onClick={onSubmitHandler}>
						Join the chat
					</button>
					<button className='btn' onClick={onExitHandler}>
						Sign Out
					</button>
				</form>
			</main>
		</div>
	)
}

export default connect(null, { loadUserData, changeUserRoom })(WelcomeWindow)
