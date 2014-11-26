"use strict";

var assert = require('assert');
var _ = require('../');

var eq = _.test.eq;
var ok = _.test.ok;

exports.testBasic = function(done){

    var calls = 0;
    var expectedCalls = 0;

    var c = _.fchain();

    c.add(function(a, b, cb){
        cb(a, b, 1);
    });

    c.add(function(a, b, cb){
        cb(a, b, 2);
    });

    var total = 0;
    c.call("a", "b", function(a, b, num){
        total += num;
        eq(a, "a");
        eq(b, "b");
    });

    eq(total, 3);
};

exports.testBreak = function(done){

    var calls = 0;
    var expectedCalls = 0;

    var c = _.fchain();

    c.add(function(a, b, cb){
        cb(a, b, 1);
    });

    c.add(function(a, b, cb){
        cb(a, b, 2);
    });

    var total = 0;
    c.call("a", "b", function(a, b, num){
        total += num;
        eq(a, "a");
        eq(b, "b");
        return(false);
    });

    eq(total, 1);
};

