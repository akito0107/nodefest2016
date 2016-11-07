'use strict'

module.exports = initialize

const mongoose = require('mongoose')

class MongoClient {
  
  constructor(options = {}) {
    this.endpoint = options.endpoint || mongoose
    mongoose.Promise = options.Promise || Promise 
  }
  
  connect(uri, options = {}) {
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

