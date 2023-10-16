const express = require('express')
const expressSession = require('express-session')
const dotenv = require('dotenv')
const dao = require('./dao')
const utils = require('./utils')
const socket = require('socket.io')

dotenv.config()

const app = express()

app.set('view engine', 'ejs')

app.use(express.static('static'))

app.use(express.urlencoded({extended: true}))

app.use(expressSession({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,                         
    saveUninitialized: false,               
    cookie: {maxAge: 86400}                
}))

const authentification = (req, res, next) => {
    if (req.session.authUserId) {
        next()
    } else {
        res.json({'errors': ['You are not authenticated']})
    }
}

app.get('/', (req, res) => {
	res.render('index')
})

app.post('/check-login', async (req, res) => {
	const id = req.session.authUserId ? req.session.authUserId : 0
	const userData = await dao.UserDao.getUserById(id)
	return res.json(userData ? {username: userData.username} : {})
})

app.post('/register', async (req, res) => {
	const username = typeof req.body.username === 'string' ? req.body.username.trim() : ''
    const password = typeof req.body.password === 'string' ? req.body.password.trim() : ''
	const errors = []
	
	if (username.length === 0 || username.length > 255) {
		errors.push('Wrong username has been provided')
	}
	
	if (password.length === 0 || password.length > 255) {
		errors.push('Wrong password has been provided')
	}
	
	const userData = await dao.UserDao.getUserByUsername(username)
	if (userData) {
		errors.push('User with provided name already exists')
	}
	
	if (!errors.length) {
		const userId = await dao.UserDao.createUser(username, password)
		const createdUserData = await dao.UserDao.getUserById(userId)
		req.session.authUserId = userId
		res.json({username: createdUserData.username})
	} else {
		res.json({errors})
	}
})


app.post('/login', async (req, res) => {
	const username = typeof req.body.username === 'string' ? req.body.username.trim() : ''
    const password = typeof req.body.password === 'string' ? req.body.password.trim() : ''
	
	const userData = await dao.UserDao.getUserByUsername(username)
	if (!userData || utils.hashPassword(password) !== userData.password) {
		res.json({errors: ['Wrong username or password has been provided']})
	} else {
		req.session.authUserId = userData.id
		res.json({username: userData.username})
	}
})


app.post('/load-messages', authentification, async (req, res) => {
	res.json({messages: await dao.MessageDao.getAllMessages()})
})


app.post('/add-message', authentification, async (req, res) => {
	const message = typeof req.body.message === 'string' ? req.body.message.trim() : ''
	
	const errors = []
	
	if (message.length === 0 || message.length > 9999) {
		errors.push('Wrong message has been provided')
	}
	
	
	if (!errors.length) {
		await dao.MessageDao.createMessage(message, req.session.authUserId)
		res.json({success: 1})
	} else {
		res.json({errors})
	}
})

app.post('/logout', authentification, async (req, res) => {
	delete req.session.authUserId
	res.json({success: 1})
})

const server = app.listen(8000)

const io = socket(server)

io.on('connection', (connection) => {
    connection.on('new-message', () => {
        io.emit('reload-messages')
    })
})