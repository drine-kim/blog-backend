const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const loginRouter = require('express').Router()

loginRouter.post('/', async (request, response) => {
    const body = request.body

    const user = await User.findOne({ username: body.username})
    const passwordCorrect = user === null 
    ? false
    : await bcrypt.compare(body.password, user.password)

    if(!(user && passwordCorrect)){
        return response.status(400).json({ error: 'invalid username or password'})
    }

    const userToken = {
        username: body.username,
        id: user._id
    }

    const token = jwt.sign(userToken,process.env.SECRET)
    response.status(200).send({token: token, username: user.username, name: user.name})
})

module.exports = loginRouter
