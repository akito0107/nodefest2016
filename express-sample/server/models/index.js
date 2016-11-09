'use strict'

const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')

const Schema = mongoose.Schema

const todoSchema = new Schema({
  body: {
    type: String,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
  },
})
todoSchema.plugin(mongoosePaginate)

const Todo = mongoose.model('Todo', todoSchema)

module.exports = {
  Todo,
}
