export const SET_USER_UNREGISTERED = 'SET_USER_UNREGISTERED'
export const SET_USER_REGISTERED = 'SET_USER_REGISTERED'
export const SET_USER_TO_LOCALSTORAGE = 'SET_USER_TO_LOCALSTORAGE'

export const setUserUnregistered = () => {
	localStorage.removeItem('registered')
	return {
		type: SET_USER_UNREGISTERED,
	}
}

export const setUserRegistered = () => {
	localStorage.setItem('registered', true)
	return {
		type: SET_USER_REGISTERED,
	}
}

export const setUserTokenToLocalStorage = (token) => {
	localStorage.setItem('user', token)
	return {
		type: SET_USER_TO_LOCALSTORAGE,
	}
}
