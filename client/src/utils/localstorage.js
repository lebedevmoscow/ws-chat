const isUserRegistered = () => {
	return localStorage.getItem('user')
}

export { isUserRegistered }
