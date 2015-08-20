"use strict";

var _ = require('../');

var eq = _.test.eq;
var ok = _.test.ok;

suite('format');

test("string", function(){
    eq(_.format("hello"), "hello");
});

test("object", function(){
    eq(_.format({ test: "hello" }), "{ test: 'hello' }");
});
