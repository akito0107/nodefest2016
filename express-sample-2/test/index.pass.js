'use strict';

var express = require('express');
var request = require('supertest');
var assert = require('power-assert');

function index(req, res) {
  res.send({ items: [] });
}

describe('GET /items', function() {
  
  it('response body contains items', function(done) {
    var app = express();
    app.get('/items', index);
    request(app)
        .get('/items')
        .expect(function(response) {
          assert(response.body.items);
        })
        .end(done)
  });
  
});

