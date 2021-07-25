const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    url: String,
    title: String,
    author: String,
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    likes: Number,
})

blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })

  // user:{
  //   username: String,
  //   name: String,
  //   id: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'User'
  //   }
  // },

const Blog = mongoose.model('Blog',blogSchema)
module.exports = Blog