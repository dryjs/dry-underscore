"use strict";

var _ = require('dry-underscore');

var eq = _.test.eq;
var ok = _.test.ok;

suite('common');

test("support_underscores", function(){

    var before = {
        camelCaseValue : "camelCaseValue",
        camelCaseFunction : function(){ return(this.value); },
        value: "test_value"
    };

    _.support_underscores(before);

    eq(before.camelCaseValue, "camelCaseValue");
    eq(before.camel_case_value, undefined);
    eq(before.camelCaseFunction(), "test_value");
    eq(before.camel_case_function(), "test_value");

});

test("_ supports underscores", function(){

    ok(_.is_function(function(){}));
    ok(!_.is_function("value"));

    ok(_.is_array([]));
    ok(!_.is_array("value"));
});

test("timeout good", function(done){

    var called = 0;

    setTimeout(_.timeout(function(err){
        eq(called, 0);
        ok(!err); 
        called++;
        done();
    }, 100), 20);

});

test("timeout error", function(done){
    var called = 0;
    setTimeout(_.timeout(function(err){
        eq(called, 0);
        eq(_.code(err), "Timeout");
        called++;
        done();
    }, 100), 200);
});

test("timeout ok args", function(done){
    var called = 0;

    function callback_later_with_args(callback){
        setTimeout(function(){
            callback(null, 1, 2, 3);
        }, 100);
    }

    callback_later_with_args(_.timeout(function(err, one, two, three){
        eq(called, 0);
        eq(_.a(arguments), [null, 1, 2, 3]);
        called++;
        done();
    }, 200));

});

test("timeout error args", function(done){

    var called = 0;

    function callback_later_with_args(callback){
        setTimeout(function(){
            callback(null, 1, 2, 3);
        }, 200);
    }

    callback_later_with_args(_.timeout(function(err, one, two, three){
        eq(called, 0);
        eq(_.code(err), "Timeout");
        eq(arguments.length, 1);
        called++;
        done();
    }, 50));
});

