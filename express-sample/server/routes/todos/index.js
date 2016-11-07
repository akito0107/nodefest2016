'use strict'

module.exports = {
  index,
  update,
}

function index(options) {
  const Todo = options.Todo
  const limit = options.limit || 30
  
  return (req = {}, res = {}, next) => {
    const query = req.query || {}
    const page = query.page || 1
    const params = { isCompleted: !!query.completed }
    
    return Todo.paginate(params, { page, limit }).then((doc) => {
      return res.send({
        todos: doc.docs,
        total: doc.total,
        limit: doc.limit,
        page: doc.page,
        pages: doc.pages,
      })
    }).catch(next)
  }
}

function update(options) {
  return (req = {}, res = {}, next) => {
    res.send({ todo: {} })
  }
}

