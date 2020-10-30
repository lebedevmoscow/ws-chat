// Types
import {
	SET_USER_REGISTERED,
	SET_USER_TO_LOCALSTORAGE,
	SET_USER_UNREGISTERED,
} from './../actions/registered'

const initialState = {
	registered: false,
	user: null,
}

const registered = (state = initialState, action) => {
	switch (action.type) {
		case SET_USER_REGISTERED:
			return { ...initialState, registered: true }
		case SET_USER_UNREGISTERED:
			return { ...initialState, user: null, registered: false }
		case SET_USER_TO_LOCALSTORAGE:
			return { ...initialState, user: action.payload, registered: true }
		default:
			return state
	}
}

export default registered
