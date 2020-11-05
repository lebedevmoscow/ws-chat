import { combineReducers } from 'redux'
import registered from './registered'
import user from './user'
import chat from './chat'

export default combineReducers({ registered, user, chat })
