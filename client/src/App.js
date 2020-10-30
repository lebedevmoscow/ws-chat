// Redux
import { useDispatch, useSelector } from 'react-redux'

// Action Types
import {
	setUserRegistered,
	setUserTokenToLocalStorage,
	setUserUnregistered,
} from './actions/registered'

// Utils
import { isUserRegistered } from './utils/localstorage'
import { useEffect } from 'react'

// Components
import RegisterModal from './Components/RegisterModal/RegisterModal'

const App = () => {
	// Redux base stuff
	const dispatch = useDispatch()

	// Data about either registered user or not
	const registeredState = useSelector((state) => state.registered)
	useEffect(() => {
		const isRegistered = isUserRegistered()
		if (!isRegistered) {
			dispatch(setUserUnregistered())
		} else {
			dispatch(setUserRegistered())
			dispatch(setUserTokenToLocalStorage(isRegistered))
		}
	}, [dispatch])

	return (
		<div className='app'>
			{!registeredState.registered && !registeredState.user && (
				<RegisterModal />
			)}
		</div>
	)
}

export default App
