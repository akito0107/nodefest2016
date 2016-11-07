'use strict'

module.exports = {
  index,
  update,
}

const TodoModel = require('../../models').Todo
const objectId = require('mongoose').Types.ObjectId
const extend = require('xtend')

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
    }).catch(next)
  }
}

function update(options) {
  const Todo = options.Todo || TodoModel
  return (req = {}, res = {}, next) => {
    const body = req.body
    
    if (!body.id) {
      return next(extend({ code: 403, message: 'missing required parameter' }, new Error()))
    }
    
    let id
    try {
      id = objectId(body.id)
    } catch (e) {
      return next(extend({
        code: 403,
        message: 'invalid parameter',
        body: {
          id: { message: 'id must be a valid format', value: body.id },
        },
      }, e))
    }
    
    Todo.findOne({ _id: id }).exec()
      .then((doc) => {
        if (!doc) {
          return next(extend({ code: 404, message: 'not found' }, new Error()))
        }
        doc.isCompleted = body.isCompleted
        doc.updatedAt = body.updatedAt
        doc.body = body.body
        return doc.save()
      })
      .then((result) => {
        return res.send({ todo: result })
      })
      .catch(next)
  }
}
