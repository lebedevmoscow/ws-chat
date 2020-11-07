import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import './index.css'
import App from './App'

// Redux
import store from './store'
import { Provider } from 'react-redux'

import RegisterModal from './Components/RegisterModal/RegisterModal'
import Chat from './Components/Chat/Chat'
import LoginModal from './Components/LoginModal/LoginModal'
import WelcomeWindow from './Components/WelcomeWindow/WelcomeWindow'
import error404 from './Components/404/404'

ReactDOM.render(
	<React.StrictMode>
		<Router>
			<Provider store={store}>
				<App />
			</Provider>
		</Router>
	</React.StrictMode>,
	document.getElementById('root')
)
