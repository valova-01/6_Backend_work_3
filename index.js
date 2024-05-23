require('dotenv').config()

const express = require('express')
const chalk = require('chalk')
const path = require('path')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const { addUser, loginUser } = require('./users.controller')
const auth = require('./middlewares/auth')
const Request = require('./models/Request')

const port = 3000
const app = express()

app.set('view engine', 'ejs')
app.set('views', 'pages')

app.use(express.static(path.resolve(__dirname, 'public')))
app.use(express.json())
app.use(cookieParser())
app.use(
  express.urlencoded({
    extended: true,
  })
)

app.get('/', (req, res) => {
  if (req.cookies.token) {
    res.redirect('/form')
  } else {
    res.redirect('/register')
  }
})

app.get('/login', async (req, res) => {
  res.render('login', {
    title: 'Express App',
    error: undefined,
  })
})

app.post('/login', async (req, res) => {
  try {
    const token = await loginUser(req.body.email, req.body.password)

    res.cookie('token', token, { httpOnly: true })

    res.redirect('/form')
  } catch (e) {
    res.render('login', {
      title: 'Express App',
      error: e.message,
    })
  }
})

app.get('/register', async (req, res) => {
  res.render('register', {
    title: 'Express App',
    error: undefined,
  })
})

app.post('/register', async (req, res) => {
  try {
    await addUser(req.body.email, req.body.password)

    res.redirect('/login')
  } catch (e) {
    if (e.code === 11000) {
      res.render('register', {
        title: 'Express App',
        error: 'Email is already registered',
      })

      return
    }
    res.render('register', {
      title: 'Express App',
      error: e.message,
    })
  }
})

app.get('/logout', (req, res) => {
  res.cookie('token', '', { httpOnly: true })

  res.redirect('/login')
})

app.use(auth)

app.post('/submit-request', async (req, res) => {
  try {
    const { fullName, phoneNumber, problemDescription } = req.body

    const newRequest = new Request({
      fullName,
      phoneNumber,
      problemDescription,
    })

    await newRequest.save()

    res.status(200).send('Request submitted successfully')
  } catch (error) {
    console.error('Error submitting request:', error)
    res.status(500).send('Error submitting request')
  }
})

app.get('/form', (req, res) => {
  res.render('form', {
    title: 'Form Page',
  })
})

app.get('/requests', async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 })

    res.render('requests', {
      title: 'Requests Table',
      requests: requests,
    })
  } catch (error) {
    console.error('Error fetching requests:', error)
    res.status(500).send('Error fetching requests')
  }
})

mongoose.connect(process.env.MONGODB_CONNECTION_STRING).then(() => {
  app.listen(port, () => {
    console.log(chalk.green(`Server has been started on port ${port}...`))
  })
})
