'use strict'

const assert = require('power-assert')

function plzRefactorToArrow() {
  return {
    value: 0,
    increment: function() {
      ++this.value;
      return this.value;
    }
  }
}

function arrow() {
  return {
    value: 0,
    increment: () => {
      ++this.value;
      return this.value;
    }
  }
}

describe('test', () => {
  it('legacy', () => {
    var obj = plzRefactorToArrow()
    assert.equal(1, obj.increment())
    assert.equal(2, obj.increment())
    assert.equal(3, obj.increment())
  })
  
  it('arrow', () => {
    var refactored = arrow()
    assert.equal(1, refactored.increment())
    assert.equal(2, refactored.increment())
    assert.equal(3, refactored.increment())
  })
})