"use strict";

var _ = require('../');

var eq = _.test.eq;
var ok = _.test.ok;

exports.testThrows = function(){

    _.test.throws(function(){
        throw(new {});
    });

    var threw = false;
    try{
        _.test.throws(function(){});
    }catch(e){
        threw = true;
    }

    ok(threw);
};


exports.testBasic = function(done){

    var no_call_bad = _.mock({
        foo: { expected_call: false }
    });

    _.test.throws(_.bind(no_call_bad.check, no_call_bad));

    var call_bad = _.mock({
        foo: { expected_call: true }
    });

    _.test.throws(_.bind(call_bad.check, no_call_bad));

    var call_good = _.mock({
        foo: { expected_call: true }
    });

    call_good.foo();

    call_good.check();

};

exports.testCallback = function(done){

    var callback_test = _.mock({
        foo: { 
            expected_call: true,
            callback: [1, 2, 3]
        }
    });

    var called = true;
    callback_test.foo(function(){
        called = true;
        eq(_.a(arguments), [1, 2, 3]);
    });

    ok(called);

    callback_test.check();

    var position_test = _.mock({
        foo: { 
            expected_call: true,
            callback: [1, 2, 3]
        }
    });

    var called = true;
    position_test.foo(1, 2, function(){
        called = true;
        eq(_.a(arguments), [1, 2, 3]);
    });

    ok(called);

    position_test.check();

    var delegate_test = _.mock({
        foo: { 
            expected_call: true,
            delegate: function(a, b, cb){
                cb(b, a);
            }
        }
    });

    var called = true;
    delegate_test.foo(1, 2, function(){
        called = true;
        eq(_.a(arguments), [2, 1]);
    });

    ok(called);

    delegate_test.check();

};

exports.testReqMock = function(){

    var body = { a: "a", b: "b" };

    var req = _.mock.req(body);

    eq(req.body, body);
    eq(req.param("a"), "a");
    eq(req.param("b"), "b");
    eq(req.param("c"), undefined);

};

