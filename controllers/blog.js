const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const logger = require('../utils/logger')
const jwt = require('jsonwebtoken')

// const getToken = request => {
//     const authorization = request.get('authorization')
//     if( authorization && authorization.toLowerCase().startsWith('bearer ')){
//         return authorization.substring(7)
//     }
//     return null
// }

blogsRouter.get('/', async (request, response) => {
    // Blog
    // .find({})
    // .then( returnedBlogs => {
    //     response.json(returnedBlogs)
    // })
        const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})
        if(blogs){
            response.json(blogs)
        }else{
            response.status(404).end()
        }
})

blogsRouter.get('/:id', async (request, response) => {
    const id = request.params.id
    // Blog
    // .findById(id)
    // .then( returnedBlog => {
    //     if(returnedBlog){
    //         return response.json(returnedBlog)
    //     }else{
    //         return response.status(400).end()
    //     }
    // })
    const blog = await Blog.findById(id)
    if(blog){
        return response.json(blog)
    }
    return response.status(400).end()
})

blogsRouter.post('/', async (request, response, next) => {
    const body = request.body
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!request.token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    const newBlog = new Blog({
        url: body.url,
        title: body.title,
        author: body.author,
        likes: body.likes === undefined ? 0 : body.likes
    })
    // newBlog
    // .save()
    // .then( result => {
    //     response.status(201).json(result)
    // })
    //const user = await User.findOne()
    //logger.info('body ',body.user)
    const user = await User.findById(decodedToken.id)
    newBlog.user = user._id
    const savedBlog = await newBlog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)

    
})


blogsRouter.put('/:id', async (request, response) => {
    const id = request.params.id

    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    //logger.info("decodedTokennnnn",decodedToken)
    if (!request.token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

    // const newBlog = new Blog(request.body)
    // newBlog._id = id
    // Blog
    // .findByIdAndUpdate(id,{$set:newBlog}, {new: true})
    // .then( updatedBlog => {
    //     response.json(updatedBlog)
    // })
    

    const blog = await Blog.findById(id)
    if(decodedToken.id.toString() === blog.user.toString()){
        const newBlog = new Blog(request.body)
        newBlog._id = id
        const updateBlog = await Blog.findByIdAndUpdate(id,{$set:newBlog}, {new: true})
        response.json(updateBlog)
    }else{
        return response.status(401).json({ error: "only the creator can update blog"})
    }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  
    const id = request.params.id
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    //logger.info("decodedTokennnnn",decodedToken)
    if (!request.token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    // Blog
    // .findByIdAndDelete(id)
    // .then( result => {
    //     response.status(204).send()
    // })
    // await Blog.findByIdAndDelete(id)
    // response.status(204).send()
    const blog = await Blog.findById(id)
    if(decodedToken.id.toString() === blog.user.toString()){
        await Blog.findByIdAndDelete(id)
        return response.status(204).end()
    }else{
        return response.status(401).json({ error: "only the creator can delete blog"})
    }
})

module.exports = blogsRouter