'use strict'

const test = require('ava')
const request = require('supertest')
const app = require('express')()
const bodyParser = require('body-parser')

const _ = require('lodash')

const mongoClientInitializer = require('../../../lib/mongo_client')
const Todo = require('../../../models').Todo
const index = require('../index').index({ Todo })

const TEST_DB = 'test_express_database'
let mongoClient

// DB Set Up
test.beforeEach(() => {
  mongoClient = mongoClientInitializer({ host: 'localhost', database: TEST_DB })
  app.use(bodyParser.json())
  app.route('/todos').get(index)
  
  return mongoClient.connect()
})

test.afterEach.always(() => {
  Todo.find({}).remove().exec()
  return mongoClient.close()
})

function requestToIndex(params = {}) {
  const query = Object.keys(params).reduce((memo, k) => {
    return `${memo}${k}=${params[k]}&`
  }, '?')
  return () => {
    return request(app).get(`/todos${query}`).expect(200)
  }
}

function createTodos(todos) {
  return Promise.all(todos.map((todo) => {
    return new Todo(todo).save()
  }))
}

test.serial.cb('todosがレスポンスに入ってくる', (t) => {
  requestToIndex()()
      .then((response) => {
        t.truthy(response.body.todos)
        t.end()
      })
      .catch(t.end)
})

test.serial.cb('DBに登録したtodoがレスポンスに入ってくる', (t) => {
  createTodos([{ body: 'some text', isCompleted: false, createdAt: Date.now() }])
      .then(requestToIndex())
      .then((response) => {
        const res = response.body.todos[0]
        t.is(res.body, 'some text')
        t.is(res.isCompleted, false)
        t.end()
      }).catch(t.end)
})

test.serial.cb('DBに登録したtodoが上位30件のみ取得できる', (t) => {
  createTodos(_.range(0, 31).map((i) => {
    return { body: `test body${i}`, isCompleted: false, createdAt: Date.now() }
  })).then(requestToIndex())
      .then((response) => {
        const todos = response.body.todos
        t.is(todos.length, 30)
        t.end()
      }).catch(t.end)
})


test.serial.cb('createdAt順にソートされてpagenationできる', (t) => {
  const now = Date.now()
  const previous = now - 1000
  
  const todos = _.range(0, 30).reduce((memo, i) => {
    memo.push({ body: `test body${i}`, isCompleted: false, createdAt: now })
    return memo
  }, [{ body: 'previous', isCompleted: false, createdAt: previous }])
  
  createTodos(todos)
      .then(requestToIndex({ page: 2 }))
      .then((response) => {
        const results = response.body
        const todo = results.todos[0]
        t.is(todo.body, 'previous')
        t.is(results.page, '2')
        t.end()
      })
      .catch(t.end)
})

test.serial.cb('ソートの順番を指定できる', (t) => {
  const now = Date.now()
  const future = now + 1000
  
  const todos = _.range(0, 30).reduce((memo, i) => {
    memo.push({ body: `test body${i}`, isCompleted: false, createdAt: now })
    return memo
  }, [{ body: 'future', isCompleted: false, createdAt: future }])
  
  createTodos(todos)
      .then(requestToIndex({ page: 2, sort: 1 }))
      .then((response) => {
        const results = response.body
        const todo = results.todos[0]
        t.is(todo.body, 'future')
        t.is(results.page, '2')
        t.end()
      })
      .catch(t.end)
})

test.serial.cb('未消化のもののみ取得できる', (t) => {
  const todos = _.range(0, 10).map(() => {
    return { body: 'completed', isCompleted: true, createdAt: Date.now() }
  }).concat(_.range(0, 10).map(() => {
    return { body: 'uncompleted', isCompleted: false, createdAt: Date.now() }
  }))
  
  createTodos(todos)
      .then(requestToIndex())
      .then((response) => {
        const results = response.body
        t.is(results.todos.length, 10)
        results.todos.forEach((todo) => {
          t.is(todo.isCompleted, false)
        })
        t.end()
      })
      .catch(t.end)
})

test.serial.cb('消化済みのものが取得できる', (t) => {
  const todos = _.range(0, 10).map(() => {
    return { body: 'completed', isCompleted: true, createdAt: Date.now() }
  }).concat(_.range(0, 10).map(() => {
    return { body: 'uncompleted', isCompleted: false, createdAt: Date.now() }
  }))
  
  createTodos(todos)
      .then(requestToIndex({ completed: true }))
      .then((response) => {
        const results = response.body
        t.is(results.todos.length, 10)
        results.todos.forEach((todo) => {
          t.is(todo.isCompleted, true)
        })
        t.end()
      })
      .catch(t.end)
})

