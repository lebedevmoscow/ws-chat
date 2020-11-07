// Redux
import { useDispatch } from 'react-redux'

// Actions
import {
	setUserRegistered,
	setUserTokenToLocalStorage,
	setUserUnregistered,
} from './actions/registered'
import { loadUserData } from './actions/user'

import { useEffect, useState } from 'react'

// Components
import RegisterModal from './Components/RegisterModal/RegisterModal'
import WelcomeWindow from './Components/WelcomeWindow/WelcomeWindow'
import Chat from './Components/Chat/Chat'
import error404 from './Components/404/404'
import LoginModal from './Components/LoginModal/LoginModal'

import { Route, Switch, Redirect } from 'react-router-dom'

const App = () => {
	// Redux base stuff
	const dispatch = useDispatch()

	useEffect(() => {
		const isRegistered = localStorage.getItem('user')
		if (!isRegistered) {
			dispatch(setUserUnregistered())
		} else {
			dispatch(setUserRegistered())
			dispatch(setUserTokenToLocalStorage(isRegistered))
			dispatch(loadUserData())
		}
	}, [])

	return (
		<>
			<Switch>
				<Route exact path='/register' component={RegisterModal} />
				<Route exact path='/login' component={LoginModal} />
				<Route exact path='/chat' component={Chat} />
				<Route
					exact
					path='/'
					render={() => {
						return localStorage.getItem('user') ? (
							<WelcomeWindow />
						) : (
							<Redirect to='/register' />
						)
					}}
				/>
				<Route component={error404} />
			</Switch>
		</>
	)
}

export default App
