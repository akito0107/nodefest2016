'use strict'

const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')

const Schema = mongoose.Schema

const todoSchema = new Schema({
  body: String,
  isCompleted: Boolean,
  createdAt: Date,
})
todoSchema.plugin(mongoosePaginate)

const Todo = mongoose.model('Todo', todoSchema)

module.exports = {
  Todo,
}
