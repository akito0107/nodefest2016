'use strict';

var express = require('express');
var request = require('supertest');
var assert = require('power-assert');

function index(options) {
  var Item = options.Item
  return function(req, res) {
    Item.find({}, function(err, docs) {
      res.send({ items: docs });
    });
  }
}

describe('GET /items', function() {
  
  it('response body contains items', function(done) {
    var Item = {
      find: function(opts, cb) {
        setImmediate(function() {
          cb(null, []);
        });
      }
    };
    var app = express();
    app.get('/items', index({ Item: Item }));
    request(app)
        .get('/items')
        .expect(function(response) {
          assert(response.body.items);
        })
        .end(done)
  });
  
  it('Get items', function(done) {
    var items = [{ id: '12345', name: 'Javascript: The Good Parts', price: 1800 }]
    var Item = {
      find: function(opts, cb) {
        setImmediate(function() {
          cb(null, items);
        });
      }
    };
    var app = express();
    app.get('/items', index({ Item: Item }));
    request(app)
        .get('/items')
        .expect({ items: items }, done);
  });
  
});

