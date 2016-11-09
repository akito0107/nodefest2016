'use strict'

module.exports = initialize

const mongoose = require('mongoose')

class MongoClient {
  
  constructor(options = {}) {
    this.endpoint = options.endpoint || mongoose
    mongoose.Promise = options.Promise || Promise
    this.host = options.host || 'localhost'
    this.database = options.database || 'express_sample_development'
  }
  
  connect(options = {}) {
    const uri = `mongodb://${this.host}/${this.database}`
    return new Promise((resolve, reject) => {
      this.endpoint.connect(uri, options, (err) => {
        if (err) {
          return reject(err)
        }
        this.connection = this.endpoint.connection
        resolve(this.connection)
      })
    })
  }
  
  close() {
    return new Promise((resolve, reject) => {
      this.connection.close((err) => {
        if (err) {
          return reject(err)
        }
        return resolve()
      })
    })
  }
}

function initialize(options) {
  return new MongoClient(options)
}

