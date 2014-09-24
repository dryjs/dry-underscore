"use strict";

var assert = require('assert');
var _ = require('../');

function hooker(){};
_.hook(hooker.prototype);

var eq = _.test.eq;
var ok = _.test.ok;

exports.testBasic = function(done){

    var calls = 0;
    var expectedCalls = 0;


    var h = _.hook();

    var actual = 0;
    var expected = 2;
    // var actualError = 0;
    // var expectedError = 2;

    h.hook("event", function(next, a, b){
        actual++; a.a++; b.b++;
        next();
    });
    h.hook("event", function(next, a, b){
        actual++; a.a++; b.b++;
        next(_.error("TestError", "A test error."));
    });
    h.hook("event", function(next, a, b){
        actual++; a.a++; b.b++;
    });

    var a = { a: 0 };
    var b = { b: 0 };

    h.serial("event", [a, b], function(err, a, b){
        ok(_.code("TestError", err));
        eq(a, { a: expected });
        eq(b, { b: expected });
        eq(actual, expected);
        expectedCalls++;
    }, 1000);

    done(function(){
        eq(expectedCalls, 1);
    });
};

exports.testCall = function(done){

    var callbacks = 0;
    
    function test(hooker){
        var calls = 0;
        var expectedCalls = 2;
        
        var handler = function(next){ calls++; next(); }
        
        hooker.hook('test', handler);
        hooker.hook('test', handler);
        
        hooker.serial('test', [1, 2, 3], function(){
            eq(this, null);
            callbacks++;
        });
        
        eq(calls, expectedCalls);
    }
    
    test(new hooker());

    done(function(){
        eq(callbacks, 1);
    });
};

exports.testRemove = function(done){
    
    var callbacks = 0;

    function test(hooker){
        var calls = 0;
        var beforeCalls = 3;
        var afterCalls = 1;
        
        var handler = function(next){ calls++; next(); }
        
        hooker.hook('test', handler);
        hooker.hook('test', handler);
        hooker.hook('test', function(next){ calls++; next(); });
        
        hooker.serial('test', function(){
            eq(calls, beforeCalls);

            calls = 0;

            hooker.unhook('test', handler);

            hooker.serial('test', function(){
                eq(calls, afterCalls);
                callbacks++;
            });

        });
    }
    
    test(new hooker());
    test(_.hook({}));

    done(function(){
        eq(callbacks, 2);
    });
};

exports.testAppendToObject = function(done){
    
    var callbacks = 0;

    function test(hooker){
        var calls = 0;
        
        var handler = function(next, a, b){ 
            a.push(calls);
            b[calls] = calls;
            calls++;
            next();
        }
        
        var e = [];
        var f = {};

        hooker.hook('test', handler);
        hooker.hook('test', handler);
        hooker.hook('test', function(next){ calls++; next({}); });
        hooker.hook('test', function(next){ calls++; next(); });
        hooker.hook('test', function(next){ calls++; next(); });
        
        hooker.serial('test', [e, f], function(err){
            eq(calls, 3);

            eq(e, [0, 1]);
            eq(f, {"0": 0, "1": 1});

            callbacks++;
        });
    }
    
    test(new hooker());
    test(_.hook({}));

    done(function(){
        eq(callbacks, 2);
    });
};

/*
exports.testParallel = function(done){
    
    var callbacks = 0;

    function test(hooker){
        var calls = 0;
        
        var handler = function(next, a, b){ 
            a.push(calls);
            b[calls] = calls;
            calls++;
            next();
        }
        
        var e = [];
        var f = {};

        hooker.hook('test', handler);
        hooker.hook('test', handler);
        hooker.hook('test', function(next){ calls++; next(false); });
        hooker.hook('test', function(next){ calls++; next(); });
        hooker.hook('test', function(next){ calls++; next(); });
        
        hooker.bite('test', e, f, function(err){
            eq(calls, 3);

            eq(e, [0, 1]);
            eq(f, {"0": 0, "1": 1});

            callbacks++;
        });
    }
    
    test(new hooker());
    test(_.hook({}));

    done(function(){
        eq(callbacks, 2);
    });
};
*/
