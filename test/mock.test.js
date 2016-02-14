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

    no_call_bad.check();

    _.test.throws(_.bind(no_call_bad.foo, no_call_bad));

    var call_bad = _.mock({
        foo: { expected_call: true }
    });

    _.test.throws(_.bind(call_bad.check, call_bad));

    var call_bad_only_args = _.mock({
        foo: { expected_args: [1, 2] }
    });

    _.test.throws(_.bind(call_bad_only_args.check, call_bad_only_args));

    var call_bad_args = _.mock({
        foo: { expected_args: [1, 2] }
    });

    var threw = false;
    try{
       call_bad_args.foo(1, 3);
    }catch(e){
        threw = true;
        eq(e.expected, 2); 
        eq(e.actual, 3); 
    }

    ok(threw);
    


    var test_good_only_args = _.mock({
        foo: { expected_args: [1, 2] }
    });

    test_good_only_args.foo(1, 2);
    test_good_only_args.check();

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

