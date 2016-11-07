'use strict'

module.exports = {
  index,
  update,
  create,
}

const TodoModel = require('../../models').Todo
const objectId = require('mongoose').Types.ObjectId
const Error = require('../../lib/error')

function index(options) {
  const Todo = options.Todo || TodoModel
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
    }).catch((e) => {
      next(new Error({}, e))
    })
  }
}

function update(options) {
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
    
    Todo.findOne({ _id: id }).exec()
      .then((doc) => {
        if (!doc) {
          return next(new Error({ code: 404, message: 'not found' }))
        }
        doc.isCompleted = body.isCompleted
        doc.updatedAt = body.updatedAt
        doc.body = body.body
        return doc.save()
      })
      .then((result) => {
        return res.send({ todo: result })
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
      createdAt: Date.now(),
    })
    todo.save().then((result) => {
      res.location = `/todos/${result._id}`
      res.send(201)
    }).catch((e) => {
      next(new Error({}, e))
    })
  }
}
