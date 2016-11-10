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

test.serial.cb('todosがレスポンスに入ってくる', (t) => {
  request(app)
      .get('/todos')
      .expect(200)
      .then((response) => {
        t.truthy(response.body.todos)
        t.end()
      })
      .catch(t.end)
})

test.serial.cb('DBに登録したtodoがレスポンスに入ってくる', (t) => {
  const todo = new Todo({ body: 'some text', isCompleted: false, createdAt: Date.now() })
  
  todo.save().then(() => {
    request(app)
        .get('/todos')
        .expect(200)
        .then((response) => {
          const res = response.body.todos[0]
          t.is(res.body, 'some text')
          t.is(res.isCompleted, false)
          t.end()
        })
        .catch(t.end)
  }).catch(t.end)
})

test.serial.cb('DBに登録したtodoが上位30件のみ取得できる', (t) => {
  const now = Date.now()
  
  Promise.all(_.range(0, 31).map((i) => {
    return new Todo({ body: `test body${i}`, isCompleted: false, createdAt: now }).save()
  })).then(() => {
    request(app)
        .get('/todos')
        .expect(200)
        .then((response) => {
          const todos = response.body.todos
          t.is(todos.length, 30)
          t.end()
        })
        .catch(t.end)
  }).catch(t.end)
})

test.serial.cb('pagenationできる', (t) => {
  const now = Date.now()
  const previous = now - 1000
  
  Promise.all(_.range(0, 30).map((i) => {
    return new Todo({ body: `test body${i}`, isCompleted: false, createdAt: now }).save()
  })).then(() => {
    return new Todo({ body: 'previous', isCompleted: false, createdAt: previous }).save()
  }).then(() => {
    request(app)
        .get('/todos?page=2')
        .expect(200)
        .then((response) => {
          const results = response.body
          const todo = results.todos[0]
          t.is(todo.body, 'previous')
          t.is(results.page, '2')
          t.end()
        })
        .catch(t.end)
  }).catch(t.end)
})

test.serial.cb('未消化のもののみ取得できる', (t) => {
  Promise.all(_.range(0, 10).map(() => {
    return new Todo({ body: 'completed', isCompleted: true, createdAt: Date.now() }).save()
  })).then(() => {
    return Promise.all(_.range(0, 10).map(() => {
      return new Todo({ body: 'uncompleted', isCompleted: false, createdAt: Date.now() }).save()
    }))
  }).then(() => {
    request(app)
        .get('/todos')
        .expect(200)
        .then((response) => {
          const results = response.body
          t.is(results.todos.length, 10)
          results.todos.forEach((todo) => {
            t.is(todo.isCompleted, false)
          })
          t.end()
        }).catch(t.end)
  }).catch(t.end)
})

test.serial.cb('消化済みのものが取得できる', (t) => {
  Promise.all(_.range(0, 10).map(() => {
    return new Todo({ body: 'completed', isCompleted: true, createdAt: Date.now() }).save()
  })).then(() => {
    return Promise.all(_.range(0, 10).map(() => {
      return new Todo({ body: 'uncompleted', isCompleted: false, createdAt: Date.now() }).save()
    }))
  }).then(() => {
    request(app)
        .get('/todos?completed=true')
        .expect(200)
        .then((response) => {
          const results = response.body
          t.is(results.todos.length, 10)
          results.todos.forEach((todo) => {
            t.is(todo.isCompleted, true)
          })
          t.end()
        }).catch(t.end)
  }).catch(t.end)
})
