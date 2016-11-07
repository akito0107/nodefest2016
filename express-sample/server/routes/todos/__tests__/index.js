'use strict'

const test = require('ava')
const mongoose = require('mongoose')
mongoose.Promise = Promise

const Schema = mongoose.Schema
const todoSchema = new Schema({
  body: String,
  isCompleted: Boolean,
  createdAt: Date,
})

const Todo = mongoose.model('Todo', todoSchema)
const TEST_DB = 'test_express_database'
const index = require('../index').index({ Todo })

let db
// DB Set Up
test.cb.beforeEach((t) => {
  db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))
  db.once('open', t.end)
  mongoose.connect(`mongodb://localhost/${TEST_DB}`)
})

test.afterEach.cb((t) => {
  Todo.find({}).remove().exec()
  db.close(t.end)
})

test('todosがレスポンスに入ってくる', (t) => {
  const todos = { todos: [] }
  
  index({}, {
    send: (result) => {
      t.deepEqual(todos, result)
      t.pass()
    },
  }, (err) => {
    t.falsy(err)
  })
})

test('DBに登録したtodoがレスポンスに入ってくる', (t) => {
  const now = Date.now()
  const todo = new Todo({ body: 'some text', isCompleted: true, createdAt: now })
  
  return todo.save().then((doc) => {
    t.truthy(doc)
    index({}, {
      send: (result) => {
        t.is(result.todos[0].body, 'some text')
        t.is(result.todos[0].isCompleted, true)
        t.deepEqual(result.todos[0].createdAt, new Date(now))
      },
    }, (e) => {
      t.falsy(e)
    })
  })
})
