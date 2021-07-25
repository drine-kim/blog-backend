const User = require('../models/user')
const userRouter = require('express').Router()
const bcrypt = require('bcrypt')
const logger = require('../utils/logger')

userRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', { url: 1, title: 1, author: 1})
    response.json(users)
})

userRouter.post('/', async (request, response) => {
    const body = request.body
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)
    const user = new User({
        username: body.username,
        password: passwordHash,
        name: body.name
    })
    const savedUser = await user.save()
    response.json(savedUser)
})

module.exports = userRouter