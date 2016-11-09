'use strict'

const test = require('ava')
const _ = require('lodash')

const mongoClientInitializer = require('../../../lib/mongo_client')
const Todo = require('../../../models').Todo
const index = require('../index').index({ Todo })

const TEST_DB = 'test_express_database'
let mongoClient

// DB Set Up
test.beforeEach(() => {
  mongoClient = mongoClientInitializer({ host: 'localhost', database: TEST_DB })
  return mongoClient.connect()
})

test.afterEach.always(() => {
  Todo.find({}).remove().exec()
  return mongoClient.close()
})

test.serial('todosがレスポンスに入ってくる', (t) => {
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

test.serial.cb('DBに登録したtodoがレスポンスに入ってくる', (t) => {
  const now = Date.now()
  const todo = new Todo({ body: 'some text', isCompleted: false, createdAt: now })
  
  todo.save().then((doc) => {
    t.truthy(doc)
    index({}, {
      send: (result) => {
        t.is(result.todos[0].body, 'some text')
        t.is(result.todos[0].isCompleted, false)
        t.deepEqual(result.todos[0].createdAt, new Date(now))
        t.end()
      },
    }, t.end)
  }).catch(t.end)
})

test.serial.cb('DBに登録したtodoが上位30件のみ取得できる', (t) => {
  const now = Date.now()
  
  Promise.all(_.range(0, 31).map((i) => {
    return new Todo({ body: `test body${i}`, isCompleted: false, createdAt: now }).save()
  })).then(() => {
    index({}, {
      send: (result) => {
        t.is(result.todos.length, 30)
        t.end()
      },
    }, t.end)
  }).catch(t.end)
})

test.serial.cb('pagenationできる', (t) => {
  const now = Date.now()
  const previous = now - 1000
  
  const request = {
    query: {
      page: 2,
    },
  }
  
  Promise.all(_.range(0, 30).map((i) => {
    return new Todo({ body: `test body${i}`, isCompleted: false, createdAt: now }).save()
  })).then(() => {
    return new Todo({ body: 'previous', isCompleted: false, createdAt: previous }).save()
  }).then(() => {
    index(request, {
      send: (results) => {
        const todo = results.todos[0]
        t.deepEqual(todo.createdAt, new Date(previous))
        t.is(todo.body, 'previous')
        t.is(results.page, 2)
        t.end()
      },
    }, t.end)
  }).catch(t.end)
})

test.serial.cb('未消化のもののみ取得できる', (t) => {
  Promise.all(_.range(0, 10).map(() => {
    return new Todo({ body: 'completed', isCompleted: true }).save()
  })).then(() => {
    return Promise.all(_.range(0, 10).map(() => {
      return new Todo({ body: 'uncompleted', isCompleted: false }).save()
    }))
  }).then(() => {
    index({}, {
      send: (results) => {
        t.is(results.todos.length, 10)
        results.todos.forEach((todo) => {
          t.is(todo.isCompleted, false)
        })
        t.end()
      },
    })
  }).catch(t.end)
})

test.serial.cb('消化済みのものが取得できる', (t) => {
  const request = {
    query: {
      completed: true,
    },
  }
  
  Promise.all(_.range(0, 10).map(() => {
    return new Todo({ body: 'completed', isCompleted: true }).save()
  })).then(() => {
    return Promise.all(_.range(0, 10).map(() => {
      return new Todo({ body: 'uncompleted', isCompleted: false }).save()
    }))
  }).then(() => {
    index(request, {
      send: (results) => {
        t.is(results.todos.length, 10)
        results.todos.forEach((todo) => {
          t.is(todo.isCompleted, true)
        })
        t.end()
      },
    })
  }).catch(t.end)
})
