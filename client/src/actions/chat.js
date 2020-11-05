import { SERVER_BASE_URL } from './../config'
export const USER_SENDING_MESSAGE = 'USER_SENDING_MESSAGE'
export const USER_SEND_MESSAGE_SUCCESS = 'USER_SEND_MESSAGE_SUCCESS'
export const USER_SEND_MESSAGE_FAIL = 'USER_SEND_MESSAGE_FAIL'

export const USER_LOADING_CHAT_HISTORY = 'USER_LOADING_CHAT_HISTORY'
export const USER_LOADING_CHAT_HISTORY_SUCCESS =
	'USER_LOADING_CHAT_HISTORY_SUCCESS'
export const USER_LOADING_CHAT_HISTORY_FAIL = 'USER_LOADING_CHAT_HISTORY_FAIL'

export const sendMessage = (msg, room, username) => {
	return async (dispatch) => {
		try {
			dispatch({ type: USER_SENDING_MESSAGE })
			const req = await fetch(`${SERVER_BASE_URL}/api/chat/newmessage`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-auth-token': localStorage.getItem('user'),
				},
				body: JSON.stringify({ message: msg, room, username }),
			})
			const res = await req.json()

			dispatch({ type: USER_SEND_MESSAGE_SUCCESS, payload: res })
		} catch (e) {
			console.log('userSendMessage error', e.message || e)
			dispatch({ type: USER_SEND_MESSAGE_FAIL })
		}
	}
}

export const loadHistory = (room) => {
	return async (dispatch) => {
		try {
			dispatch({ type: USER_LOADING_CHAT_HISTORY })
			const req = await fetch(`${SERVER_BASE_URL}/api/chat/loadhistory`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-auth-token': localStorage.getItem('user'),
				},
				body: JSON.stringify({ room }),
			})
			const res = await req.json()

			dispatch({ type: USER_LOADING_CHAT_HISTORY_SUCCESS, payload: res })
		} catch (e) {
			console.log('Canoot load chat history', e.message || e)
			dispatch({ type: USER_LOADING_CHAT_HISTORY_FAIL })
		}
	}
}
