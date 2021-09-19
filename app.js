const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
require('express-async-errors')
const logger = require('./utils/logger')
const config = require('./utils/config')
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blog')
const userRouter = require('./controllers/user')
const loginRouter = require('./controllers/login')
const commentsRouter = require('./controllers/comment')


logger.info('Connecting to',config.MONGODB_URI)
mongoose
.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true  })
.then ( result => {
    logger.info('Connected to MongoDB.')
})
.catch( error => {
    logger.error('===',error)
})

app.use(express.static('build'))
app.use(express.json())
app.use(cors())
app.use(middleware.tokenExtrator)
app.use('/api/blogs',blogsRouter)
app.use('/api/users',userRouter)
app.use('/api/comments',commentsRouter)
app.use('/api/login',loginRouter)

if(process.env.NODE_ENV === 'test'){
    const testingRouter = require('./controllers/testing')
    app.use('/api/testing',testingRouter)
}
app.use(middleware.unknownEndpoint)
app.use(middleware.requestLogger)
app.use(middleware.errorHandler)



module.exports = app