'use strict'

var express = require('express');
var app = express();
var request = require('supertest')

function index(req, res) {
  res.send([{id: 123, name: 'Javascript: Good Parts', price: 2000}])
}

describe('GET /items', function() {

  it('Status Code 200が返ってくる', function(done) {
    app.get('/items', index);

    request(app)
      .get('/items')
      .expect(200, done);
  });

  it('itemsがjsonで返ってくる', function(done) {
    var items = [{id: 123, name: 'Javascript: Good Parts', price: 2000}]

    app.get('/items', index);

    request(app)
      .get('/items')
      .expect(items, done);
  });

  it.skip('', function(done) {
  });
});
