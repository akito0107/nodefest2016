'use strict'

module.exports = {
  index,
  update,
  create,
  show,
}

const TodoModel = require('../../models').Todo
const objectId = require('mongoose').Types.ObjectId
const Error = require('../../lib/error')

function index(options = {}) {
  const Todo = options.Todo || TodoModel
  const limit = options.limit || 30
  
  return (req = {}, res = {}, next) => {
    const query = req.query || {}
    const page = query.page || 1
    const params = { isCompleted: !!query.completed }
    const sort = query.sort ? {} : { createdAt: -1 }
    
    return Todo.paginate(params, { page, limit, sort }).then((doc) => {
      return res.json({
        todos: doc.docs,
        total: doc.total,
        limit: doc.limit,
        page: doc.page,
        pages: doc.pages,
      })
    }).catch((e) => {
      next(new Error({}, e))
    })
  }
}

function update(options = {}) {
  const Todo = options.Todo || TodoModel
  return (req = {}, res = {}, next) => {
    const body = req.body
    const params = req.params
    
    if (!params.id) {
      return next(new Error({ code: 403, message: 'missing required parameter' }))
    }
    
    let id
    try {
      id = objectId(params.id)
    } catch (e) {
      return next(new Error({
        code: 403,
        message: 'invalid parameter',
        body: {
          id: { message: 'id must be a valid format', value: params.id },
        },
      }, e))
    }
    
    Todo.findOneAndUpdate({ _id: id }, {
      $set: {
        body: body.body,
        isCompleted: body.isCompleted,
        updatedAt: body.updatedAt,
      },
    }, { new: true }).exec()
        .then((result) => {
  
          if (!result) {
            return next(new Error({ code: 404, message: 'not found' }))
          }
          return res.json({ todo: result })
        })
        .catch((e) => {
          next(new Error({}, e))
        })
  }
}

function create(options = {}) {
  const Todo = options.Todo || TodoModel
  return (req = {}, res = {}, next) => {
    const body = req.body
    const todo = new Todo({
      body: body.body,
      isCompleted: false,
      createdAt: Date.now(),
    })
    todo.save().then((result) => {
      res.location = `/todos/${result._id}`
      res.status(201)
      res.json({})
    }).catch((e) => {
      next(new Error({}, e))
    })
  }
}

function show(options = {}) {
  return (req, res, next) => {
    res.send(200)
  }
}
