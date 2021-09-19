const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const Comment = require('../models/comment')
const jwt = require('jsonwebtoken')

// const getToken = request => {
//     const authorization = request.get('authorization')
//     if( authorization && authorization.toLowerCase().startsWith('bearer ')){
//         return authorization.substring(7)
//     }
//     return null
// }

blogsRouter.get('/', async (request, response) => {
        //const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})
        //const blogs = await Blog.find({}).populate('user', {username: 1, name: 1}).populate('comments',{text: 1, user: 1, blog: 1})
        const blogs = await Blog.find({}).populate('user', {username: 1, name: 1}).populate('comments',{text: 1, user : 1, blog: 1})
        // .populate({
        //     path: 'comments',
        //     // Get friends of friends - populate the 'friends' array for every friend
        //     populate: { path: 'user' }
        //   })
        if(blogs){
            response.json(blogs)
        }else{
            response.status(404).end()
        }
})

blogsRouter.get('/:id', async (request, response) => {
    const id = request.params.id
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
    const user = await User.findById(decodedToken.id)
    //console.log('userrrrrr ',user);
    newBlog.user = user._id
    const savedBlog = await newBlog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
   

    
})


blogsRouter.put('/:id', async (request, response) => {
    const id = request.params.id
    const newBlog = new Blog(request.body)
    const blog = await Blog.findById(id)
    newBlog._id = id
    newBlog.comments = blog.comments
    const updateBlog = await Blog.findByIdAndUpdate(id,{$set:newBlog}, {new: true}).populate('user', {username: 1, name: 1}).populate('comments',{text: 1, user: 1})

    if(updateBlog){
        return response.json(updateBlog)
    }
    return response.status(400).end()




    //const id = request.params.id

    // const decodedToken = jwt.verify(request.token, process.env.SECRET)
    // //logger.info("decodedTokennnnn",decodedToken)
    // if (!request.token || !decodedToken.id) {
    //     return response.status(401).json({ error: 'token missing or invalid' })
    // }

    // const blog = await Blog.findById(id)
    // if(decodedToken.id.toString() === blog.user.toString()){
    //     const newBlog = new Blog(request.body)
    //     // console.log('bodyyy',request.body);
    //     // console.log('newBlogggggggggggg',newBlog);
    //     newBlog._id = id
    //     newBlog.comments = blog.comments
    //     const updateBlog = await Blog.findByIdAndUpdate(id,{$set:newBlog}, {new: true}).populate('user', {username: 1, name: 1}).populate('comments',{text: 1, user: 1})
    //     //console.log('updated Blog',updateBlog);
    //     response.json(updateBlog)
    // }else{
    //     return response.status(401).json({ error: "only the creator can update blog"})
    // }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  
    const id = request.params.id
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    //logger.info("decodedTokennnnn",decodedToken)
    if (!request.token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

    const blogs = await Blog.findById(id)
    if(decodedToken.id.toString() === blogs.user.toString()){
        await Blog.findByIdAndDelete(id)
        await Comment.deleteMany({blog: id})
        return response.status(204).end()
    }else{
        return response.status(401).json({ error: "only the creator can delete blog"})
    }
})

module.exports = blogsRouter