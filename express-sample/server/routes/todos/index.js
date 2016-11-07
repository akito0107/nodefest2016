'use strict'

module.exports = {
  index,
  update,
}

const Todo = require('../../models').Todo

function index(options) {
  const Todo = options.Todo || Todo
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
  const Todo = options.Todo || Todo
  return (req = {}, res = {}, next) => {
    const body = req.body
    
    Todo.findOne({ _id: body.id }).exec()
        .then((doc) => {
          doc.isCompleted = body.isCompleted
          doc.updatedAt = body.updatedAt
          doc.body = body.body
          return doc.save()
        }).then((result) => {
          return res.send({ todo: result })
        }).catch(next)
  }
}

