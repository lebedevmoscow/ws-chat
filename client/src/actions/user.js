import { SERVER_BASE_URL } from './../config'

// Action types
export const LOAD_USER_DATA = 'LOAD_USER_DATA'
export const LOAD_USER_DATA_SUCCESS = 'LOAD_USER_DATA_SUCCESS'
export const LOAD_USER_DATA_FAIL = 'LOAD_USER_DATA_FAIL'
export const USER_CHOISE_ROOM = 'USER_CHOISE_ROOM'

// Fetch user data from server
export const loadUserData = () => async (dispatch) => {
	// Start loading
	dispatch({ type: LOAD_USER_DATA })

	// Getting JWT from localstorage
	const token = localStorage.getItem('user')

	let data
	try {
		// Loading user data from server
		const req = await fetch(`${SERVER_BASE_URL}/api/user`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-auth-token': token,
			},
		})

		data = await req.json()
	} catch (e) {
		console.log('Cannot fetch user data', e.message || e)
	}

	// If during the request we face with error
	if (data.user) {
		dispatch({ type: LOAD_USER_DATA_SUCCESS, payload: data })
	} else {
		dispatch({ type: LOAD_USER_DATA_FAIL })
	}

	return data
}

// If user want to change the room we'll gonna
// mark this action in database (change the "room" record)
export const changeUserRoom = (room, alias) => async (dispatch) => {
	const token = localStorage.getItem('user')
	try {
		await fetch(`${SERVER_BASE_URL}/api/user/changeroom`, {
			headers: {
				'Content-Type': 'application/json',
				'x-auth-token': token,
			},
			method: 'POST',
			body: JSON.stringify({ room: room, alias: alias }),
		})

		return dispatch({
			type: USER_CHOISE_ROOM,
			payload: { room, roomalias: alias },
		})
	} catch (e) {
		console.log('Cannot Update User Room', e.message || e)
	}
}
