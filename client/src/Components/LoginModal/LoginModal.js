import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Redux
import { useDispatch } from 'react-redux'
import {
	setUserRegistered,
	setUserTokenToLocalStorage,
} from './../../actions/registered'
import { LOAD_USER_DATA, LOAD_USER_DATA_SUCCESS } from './../../actions/user'

import { SERVER_BASE_URL } from './../../config'

// Styles

import { Redirect, Link } from 'react-router-dom'

// Style for Modal
function getModalStyle() {
	const top = 50
	const left = 50

	return {
		top: `${top}%`,
		left: `${left}%`,
		transform: `translate(-${top}%, -${left}%)`,
	}
}

const useStyles = makeStyles((theme) => ({
	paper: {
		position: 'absolute',
		width: 400,
		backgroundColor: theme.palette.background.paper,
		border: '2px solid #000',
		boxShadow: theme.shadows[5],
		padding: theme.spacing(2, 4, 3),
	},
}))

export default function SimpleModal(props) {
	const dispatch = useDispatch()
	const classes = useStyles()
	const [modalStyle] = React.useState(getModalStyle)
	const [open] = React.useState(true)
	const [redirect, setRedirect] = React.useState(false)

	// FormData
	const [email, setemail] = useState('')
	const [password, setpassword] = useState('')

	const onChangeHandler = (e) => {
		switch (e.target.name) {
			case 'email':
				setemail(e.target.value)
				break
			case 'password':
				setpassword(e.target.value)
				break
			default:
				return
		}
	}

	const onSubmit = async (e) => {
		e.preventDefault()

		// Check if email is do not match the RegEx (literally check on valid email)
		if (!email.match(/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/)) {
			return toast.error('Invalid email', {
				position: 'top-right',
				autoClose: 5000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			})
		}

		// Data for post request
		const data = {
			email,
			password,
		}

		// Register the user
		let res = await fetch(`${SERVER_BASE_URL}/api/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		})

		res = await res.json()

		// If login has been successful
		if (res.status === 200) {
			dispatch(setUserRegistered())
			dispatch(setUserTokenToLocalStorage(res.token))

			const user = { user: res.user }
			dispatch({ type: LOAD_USER_DATA })
			dispatch({ type: LOAD_USER_DATA_SUCCESS, payload: user })

			setRedirect(true)

			return toast.success(res.msg, {
				position: 'top-right',
				autoClose: 5000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			})
		}

		// If it's not
		if (res.status.toString() === '409') {
			return toast.error(res.msg, {
				position: 'top-right',
				autoClose: 5000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			})
		}

		if (res.status.toString() === '400') {
			return res.errors.map((error) => {
				return toast.error(error, {
					position: 'top-right',
					autoClose: 5000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
				})
			})
		}
	}

	// Inner modal
	const body = (
		<div
			style={modalStyle}
			className={`${classes.paper} registermodal__modal`}
		>
			<h2 id='simple-modal-title'>For chatting you have to login</h2>
			<h3>Please fill to login</h3>
			<form className='registermodal__form'>
				<input
					type='email'
					placeholder='type email'
					name='email'
					value={email}
					required
					onChange={onChangeHandler}
				></input>
				<input
					type='password'
					placeholder='type password'
					name='password'
					value={password}
					required
					autoComplete='on'
					onChange={onChangeHandler}
				></input>
				<button onClick={onSubmit}>Submit!</button>
				<h4 style={{ paddingTop: 20 }}>Do not have already account?</h4>
				<button style={{ marginTop: 20 }}>
					<Link to='/login'>Register!</Link>
				</button>
			</form>
		</div>
	)

	if (localStorage.getItem('user') && localStorage.getItem('registered')) {
		console.log('redirect')
		return <Redirect to='/' />
	}

	if (redirect) {
		return <Redirect to='/' />
	}

	return (
		<div>
			<Modal
				open={open}
				aria-labelledby='simple-modal-title'
				aria-describedby='simple-modal-description'
			>
				{body}
			</Modal>
			<ToastContainer />
		</div>
	)
}
