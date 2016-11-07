'use strict'

const _ = require('lodash')

const DEFAULT_BODY = {
  code: 500,
  message: 'something wrong, please try later',
  body: {},
}
class ExpressError {
  constructor(body = {}, e = new Error()) {
    _.assign(this, DEFAULT_BODY, { error: e }, body)
  }
}

module.exports = ExpressError
