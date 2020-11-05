import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import LoginModal from './../LoginModal/LoginModal'

// Redux
import { useDispatch } from 'react-redux'
import {
	setUserRegistered,
	setUserTokenToLocalStorage,
} from './../../actions/registered'
import { LOAD_USER_DATA, LOAD_USER_DATA_SUCCESS } from './../../actions/user'

// Styles
import './RegisterModal.sass'
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

	// FormData
	const [email, setemail] = useState('')
	const [username, setusername] = useState('')
	const [password, setpassword] = useState('')
	const [password2, setpassword2] = useState('')

	const onChangeHandler = (e) => {
		switch (e.target.name) {
			case 'email':
				setemail(e.target.value)
				break
			case 'username':
				setusername(e.target.value)
				break
			case 'password':
				setpassword(e.target.value)
				break
			case 'password2':
				setpassword2(e.target.value)
				break
			default:
				return
		}
	}

	const onSubmit = async (e) => {
		e.preventDefault()

		// Check if password and password2 are the same
		if (!isPasswordEquals(password, password2)) {
			return toast.error('Repeated password are incorrect', {
				position: 'top-right',
				autoClose: 5000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			})
		}

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
			username,
		}

		// Register the user
		let res = await fetch('http://31.148.82.202:3001/api/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		})

		res = await res.json()

		// If regestration has been successful
		if (res.status.toString() === '200') {
			dispatch(setUserRegistered())
			dispatch(setUserTokenToLocalStorage(res.token))

			const user = { user: res.user }
			dispatch({ type: LOAD_USER_DATA })
			dispatch({ type: LOAD_USER_DATA_SUCCESS, payload: user })

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

	// Check on equals passwords
	const isPasswordEquals = (pass1, pass2) => {
		if (pass1 === pass2) {
			return true
		}
		return false
	}

	// Inner modal
	const body = (
		<div
			style={modalStyle}
			className={`${classes.paper} registermodal__modal`}
		>
			<h2 id='simple-modal-title'>For chatting you have to register</h2>
			<small>Don't worry, it won't takes so much time</small>
			<h3>Please fill the form to register</h3>
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
					type='username'
					placeholder='type user name'
					name='username'
					value={username}
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
				<input
					type='password'
					placeholder='repeat password'
					name='password2'
					value={password2}
					autoComplete='on'
					required
					onChange={onChangeHandler}
				></input>
				<button onClick={onSubmit}>Submit!</button>
				<h4 style={{ paddingTop: 20 }}>Do you have already account?</h4>
				<button style={{ marginTop: 20 }}>
					<Link to='/login'>Login!</Link>
				</button>
			</form>
		</div>
	)

	if (localStorage.getItem('user') && localStorage.getItem('registered')) {
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
