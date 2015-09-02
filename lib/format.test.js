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

test("phone_number", function(){
    eq(_.format.phone_number(null), null);
    eq(_.format.phone_number("01234567890"), "0-123-456-7890");
    eq(_.format.phone_number("0123456789"), "012-345-6789");
    eq(_.format.phoneNumber("0123456789"), "012-345-6789");
    eq(_.format.phone_number("035555555"), "035555555");
    eq(_.format.phone_number("hello"), "hello");
});
