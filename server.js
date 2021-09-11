if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

//Imports
const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

// Creating the router
const indexRouter = require('./routes/index')
const developerRouter = require('./routes/developers')
const gameRouter = require('./routes/games')

//Setting the view engine
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))

const mongoose = require('mongoose')
// Due to deprecation added useUnifiedTopology: true,
mongoose.connect(process.env.DATABASE_URL, {useUnifiedTopology: true, useNewUrlParser: true})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

// Using the router
app.use('/', indexRouter)
app.use('/developers', developerRouter)
app.use('/games', gameRouter)

app.listen(process.env.PORT  || 3000)