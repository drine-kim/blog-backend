const commentsRouter = require("express").Router()
const Blog = require("../models/blog")
const Comment = require('../models/comment')
const jwt = require('jsonwebtoken')

commentsRouter.get('/', async (req,res) => {
    const comments = await Comment.find({})
    if(comments){
        res.json(comments)
    }else{
        res.status(404).end()
    }
})

commentsRouter.get('/:id', async (request, response) => {
    const id = request.params.id
    const comment = await Comment.findById(id)
    if(comment){
        return response.json(comment)
    }
    return response.status(400).end()
})

commentsRouter.post('/:id', async (req,res) => {
    const id = req.params.id
   // console.log('id is  ',id)
    const body = req.body
    const newObj = new Comment({
        text: body.text,
        blog: id,
        user: body.user,
    })
    //console.log('new comment is ',newObj)
    await newObj.save()
    const blogRelated = await Blog.findById(id)
    //console.log('blog relatedddd ', blogRelated)
    blogRelated.comments.push(newObj)
    //console.log('blog relatedddd with comments ', blogRelated)
    blogRelated.save( function(err){
        if(err){
            return res.status(500).json({"error": error})
        }
        //res.redirect('/')
        res.status(201).json(newObj)
    })
})

commentsRouter.delete('/:id', async (request, response, next) => {
  
    const blogId = request.params.id 
    const commentId = request.body.commentId
    //console.log('commentIdddd ', commentId);
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    //console.log("decodedTokennnnn",decodedToken)
    if (!request.token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    const comment = await Comment.findOne({ _id: commentId, blog: blogId})
    if(decodedToken.id.toString() === comment.user.toString()){
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
              $pull: { comments: commentId },
            },
            { new: true }
          );
        if(!blog){
            return res.status(400).send("Post not found");
        }
        await Comment.findByIdAndDelete(commentId)
        return response.status(204).end()
    }else{
        return response.status(401).json({ error: "only the creator can delete comment"})
    }
})

module.exports = commentsRouter