import { SERVER_BASE_URL } from './../config'
export const USER_SENDING_MESSAGE = 'USER_SENDING_MESSAGE'
export const USER_SEND_MESSAGE_SUCCESS = 'USER_SEND_MESSAGE_SUCCESS'
export const USER_SEND_MESSAGE_FAIL = 'USER_SEND_MESSAGE_FAIL'

export const USER_LOADING_CHAT_HISTORY = 'USER_LOADING_CHAT_HISTORY'
export const USER_LOADING_CHAT_HISTORY_SUCCESS =
	'USER_LOADING_CHAT_HISTORY_SUCCESS'
export const USER_LOADING_CHAT_HISTORY_FAIL = 'USER_LOADING_CHAT_HISTORY_FAIL'

export const USER_DELETING_MESSAGE = 'USER_DELETING_MESSAGE'
export const USER_DELETING_MESSAGE_SUCCESS = 'USER_DELETING_MESSAGE_SUCCESS'
export const USER_DELETING_MESSAGE_FAIL = 'USER_DELETING_MESSAGE_FAIL'

export const USER_EDITING_MESSAGE = 'USER_EDITING_MESSAGE'
export const USER_EDITING_MESSAGE_SUCCESS = 'USER_EDITING_MESSAGE_SUCCESS'
export const USER_EDITING_MESSAGE_FAIL = 'USER_EDITING_MESSAGE_FAIL'

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
			return res
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

export const removeMessage = (id) => {
	return async (dispatch) => {
		dispatch({ type: USER_DELETING_MESSAGE })
		try {
			const req = await fetch(
				`${SERVER_BASE_URL}/api/chat/deletemessage`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'x-auth-token': localStorage.getItem('user'),
					},
					body: JSON.stringify({ id }),
				}
			)
			const res = await req.json()
			dispatch({ type: USER_DELETING_MESSAGE_SUCCESS, payload: res })
		} catch (e) {
			console.log('Cannot remove message', e.message || e)
			dispatch({ type: USER_DELETING_MESSAGE_FAIL })
		}
	}
}

export const editMessage = (id, editedMessage) => {
	return async (dispatch) => {
		dispatch({ type: USER_EDITING_MESSAGE })
		try {
			const req = await fetch(`${SERVER_BASE_URL}/api/chat/editmessage`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-auth-token': localStorage.getItem('user'),
				},
				body: JSON.stringify({ id, editedMessage }),
			})

			const res = await req.json()
			console.log('res', res)
			dispatch({ type: USER_EDITING_MESSAGE_SUCCESS, payload: res })
		} catch (e) {
			console.log('Cannot edit message', e.messae || e)
			dispatch({ type: USER_EDITING_MESSAGE_FAIL })
		}
	}
}
