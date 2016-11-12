'use strict';

const express = require('express');
const request = require('supertest');
const assert = require('power-assert');
const _ = require('lodash');

function index(options) {
  var Item = options.Item
  return (req, res) => {
    Item.pagenate({}, {}).then((docs) => {
      res.send({ items: docs });
    });
  }
}

function initMockDb(items) {
  return {
    pagenate: (query, opts) => {
      const page = opts.page || 1
      return Promise.resolve(items.slice(30 * (page - 1), 30 * page))
    }
  };
}

describe('GET /items', () => {
  
  it('response body contains items', (done) => {
    const app = express();
    app.get('/items', index({ Item: initMockDb([]) }));
    request(app)
        .get('/items')
        .expect((response) => {
          assert(response.body.items);
        })
        .end(done)
  });
  
  it('Get items', function(done) {
    var items = [{ id: '12345', name: 'Javascript: The Good Parts', price: 1800 }]
    var app = express();
    app.get('/items', index({ Item: initMockDb(items) }));
    request(app)
        .get('/items')
        .expect({ items: items }, done);
  });
  
  it('Pagenation with limit=30', function(done) {
    var items = _.range(0, 31).map(function(i) {
      return { id: i.toString(), name: 'name', price: 1200 }
    });
    
    var app = express();
    app.get('/items', index({ Item: initMockDb(items) }));
    request(app)
        .get('/items')
        .expect(function(response) {
          assert.equal(response.body.items.length, 30)
        })
        .end(done);
  });
  
});

