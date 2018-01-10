var assert = require('assert');

//https://mochajs.org/

// Tutorial
//https://semaphoreci.com/community/tutorials/getting-started-with-node-js-and-mocha

var server = require('../app');

describe('Array', function() {
    describe('#indexOf()', function() {
        it('should return -1 when the value is not present', function() {
            assert.equal([1,2,3].indexOf(4), -1);
        });
    });
});

