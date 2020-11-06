import {
	LOAD_USER_DATA,
	LOAD_USER_DATA_FAIL,
	LOAD_USER_DATA_SUCCESS,
	USER_CHOISE_ROOM,
} from './../actions/user'

const initialState = {
	username: null,
	email: null,
	hashedPassword: null,
	loading: false,
	error: null,
	room: null,
	roomalias: null,
}

const user = (state = initialState, action) => {
	switch (action.type) {
		case LOAD_USER_DATA:
			return {
				...state,
				loading: true,
			}
		case LOAD_USER_DATA_SUCCESS:
			return {
				...state,
				loading: false,
				error: null,
				email: action.payload.user.email,
				username: action.payload.user.username,
				hashedPassword: action.payload.user.password,
				room: action.payload.user.room,
				roomalias: action.payload.user.roomalias,
			}
		case LOAD_USER_DATA_FAIL:
			return {
				...state,
				loading: false,
				error: true,
				username: null,
				hashedPassword: null,
				room: null,
				roomalias: null,
			}
		case USER_CHOISE_ROOM:
			return {
				...state,
				room: action.payload.room,
				roomalias: action.payload.roomalias,
			}
		default:
			return state
	}
}

export default user
