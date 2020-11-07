import {
	USER_LOADING_CHAT_HISTORY,
	USER_LOADING_CHAT_HISTORY_FAIL,
	USER_LOADING_CHAT_HISTORY_SUCCESS,
	USER_DELETING_MESSAGE,
	USER_DELETING_MESSAGE_FAIL,
	USER_DELETING_MESSAGE_SUCCESS,
} from './../actions/chat'

const initialState = {
	history: null,
	errorhistory: null,
	loadinghistory: true,
	lastmessage: null,
	messageerror: null,
	messageloading: null,
}

const chatReducer = (state = initialState, action) => {
	switch (action.type) {
		case USER_LOADING_CHAT_HISTORY:
			return {
				...state,
				history: null,
				errorhistory: null,
				loadinghistory: true,
			}
		case USER_LOADING_CHAT_HISTORY_FAIL:
			return {
				...state,
				history: null,
				errorhistory: true,
				loadinghistory: false,
			}

		case USER_LOADING_CHAT_HISTORY_SUCCESS:
			return {
				...state,
				history: action.payload,
				errorhistory: false,
				loadinghistory: false,
			}
		default:
			return state
	}
}

export default chatReducer
