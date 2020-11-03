import { combineReducers } from 'redux'
import registered from './registered'
import user from './user'

export default combineReducers({ registered, user })
