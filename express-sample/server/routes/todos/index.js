'use strict'

module.exports = {
  index,
}

function index(options) {
  const Todo = options.Todo
  
  return (req, res, next) => {
    Todo.find({}).exec().then((doc) => {
      return res.send({ todos: doc })
    }).catch(next)
  }
}
