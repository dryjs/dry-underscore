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

test("inspect", function(){
    eq(_.inspect({ test: "hello" }), "{ test: 'hello' }");
});

test("inspect", function(){
    eq(_.inspect({ test: "hello", obj: { a: {} } }, { depth: 0 }), "{ test: 'hello', obj: [Object] }");
    eq(_.inspect({ test: "hello", obj: { a: {} } }, { depth: 1 }), "{ test: 'hello', obj: { a: {} } }");
});

test("phone_number", function(){
    eq(_.format.phone_number(null), null);
    eq(_.format.phone_number("01234567890"), "0-123-456-7890");
    eq(_.format.phone_number("11234567890"), "1-123-456-7890");
    eq(_.format.phone_number("+11234567890"), "+1 123-456-7890");
    eq(_.format.phone_number("+0123456789"), "012-345-6789");
    eq(_.format.phoneNumber("+0123456789"), "012-345-6789");
    eq(_.format.phone_number("+0123456789"), "012-345-6789");
    eq(_.format.phoneNumber("+0123456789"), "012-345-6789");
    eq(_.format.phone_number("035555555"), "035555555");

    eq(_.format.phone_number("+1 123-456-7890"), "+1 123-456-7890");
    eq(_.format.phone_number("+012-345-6789"), "012-345-6789");
    eq(_.format.phone_number("+012-345-6789"), "012-345-6789");
    eq(_.format.phoneNumber("+012-345-6789"), "012-345-6789");
    eq(_.format.phoneNumber("asdf phone number +012-345-6789 blah"), "012-345-6789");
    eq(_.format.phone_number("035555555"), "035555555");
 
    eq(_.format.phone_number("hello"), "hello");
});

test("number", function(){
    eq(_.format.number(null), null);
    eq(_.format.number("1234.123456", 2), "1,234.12");
    eq(_.format.number("1234.123456", 2), "1,234.12");
    eq(_.format.number("1234.100000", 2), "1,234.10");
    eq(_.format.number("1234.100000", 2, false), "1,234.1");
    eq(_.format.number("1234.123400", 8, false), "1,234.1234");
    eq(_.format.number("1234.123456", 4), "1,234.1235");
    eq(_.format.number("1234.123456", -2), "1,234");

    eq(_.format.number("1234.123456", { max: 2,  decimal: "-", order: "." }), "1.234-12");
    eq(_.format.number("1234.100000", { fixed: 4, decimal: "-", order: "." }), "1.234-1000");
    eq(_.format.number("1234.100000", { max: 4, decimal: "-", order: "." }), "1.234-1");
    eq(_.format.number("1234.100000", { max: 4, decimal: "-", order: "" }), "1234-1");
});
