// const dummy = (blogs) => {
//     return 1
// }
  
// module.exports = {
// dummy
// }

const totalLikes = (blogs) => {
    const reducer = (sum, blog) => {
        //console.log('   ',blog.likes)
        return sum + blog.likes
    }
    return blogs.length === 0 
    ? 0 
    : blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    const maxLike = Math.max( ...blogs.map (blog => (blog.likes)))
    const maxBlog = blogs.find ( blog => blog.likes === maxLike)
    console.log('maxbloggggg ',maxBlog);
    return {
        title: maxBlog.title,
        author: maxBlog.author,
        likes: maxBlog.likes
      }
}

const mostLikes  = (blogs) => {
    const maxLike = Math.max ( ...blogs.map (blog => blog.likes))
    const maxBlog = blogs.find (blog => blog.likes === maxLike)
    console.log('max author blog',maxBlog)
    return {
        author: maxBlog.author,
        likes: maxBlog.likes
    }
}

module.exports = {
    totalLikes,
    favoriteBlog,
    mostLikes
}