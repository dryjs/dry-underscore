"use strict";

var assert = require('assert');
var _ = require('../');

var eq = _.test.eq;
var ok = _.test.ok;

function test_hooker(count){

    var h = _.hook();

    var push_index = function(next, a, b){
        if(a){ a.push(a.length); }
        if(b){ b.push(b.length); }
        next();
    };

    _.for(count, function(){
        h.hook("push_index", push_index);
    });

    return(h);
}

exports.testBasic = function(done){

    var h = test_hooker(3);

    var called = false;

    h.bite("push_index", [[],[]], function(err, a, b){
        eq(null, err);
        eq(a, [0, 1, 2]);
        eq(b, [0, 1, 2]);
        called = true;
    });

    done(function(){
        ok(called);
    });
};

exports.testPrototype = function(done){

    function hooker(){};
    _.hook(hooker.prototype);

    hooker.prototype.test = _.hook.event_function("test");

    var h = new hooker();

    function handler(next, a){ a.push(a.length); next(); }

    h.test(handler);
    h.test(handler);

    var called = false;
    h.bite("test", [[]], function(err, a){
        called = true;
        ok(!err);
        eq(a, [0, 1]);
    });

    done(function(){
        ok(called);
    });
};

exports.testError = function(done){

    var h = test_hooker(3);

    h.hook("push_index", function(next){
        next(_.error("TestError", "A test error."));
    });

    var function_after_error_called = false;
    h.hook("push_index", function(next){
        function_after_error_called = true;
    });

    var called = false;

    h.bite("push_index", [[],[]], function(err, a, b){
        eq(_.code(err), "TestError");
        eq(a, undefined);
        eq(b, undefined);
        eq(function_after_error_called, false);
        called = true;
    });

    done(function(){ ok(called); });

};

exports.testErrorHandlersSimple = function(done){

    var h = test_hooker(3);

    h.hook("push_index", function(next){
        next(_.error("TestError", "A test error."));
    });

    var no_catch_called = false;
    h.hook("push_index", function(next){
        no_catch_called = true;
    });

    var catch_called = false;
    h.hook("push_index", function(err, next){
        catch_called = true;
        eq(_.code(err), "TestError");
        next(err);
    }, true);

    var called = false;

    h.bite("push_index", [[],[]], function(err, a, b){
        called = true;
        eq(_.code(err), "TestError");
        ok(!err.rewritten);
        ok(!err.swallowed);
        eq(a, undefined);
        eq(b, undefined);
    });

    ok(catch_called);
    ok(!no_catch_called);

    done(function(){ ok(called); });
};

exports.testErrorRewrite = function(done){

    var h = test_hooker(3);

    h.hook("push_index", function(next){
        next(_.error("TestError", "A test error."));
    });

    var no_catch_called = false;
    h.hook("push_index", function(next){
        no_catch_called = true;
    });

    var catch_called = false;
    h.hook("push_index", function(err, next){
        catch_called = true;
        eq(_.code(err), "TestError");
        next(_.error("RewriteError", "", err));
    }, true);

    var called = false;

    h.bite("push_index", [[],[]], function(err, a, b){
        called = true;
        eq(_.code(err), "RewriteError");
        ok(err.rewritten);
        eq(_.code(err.original), "TestError");
        eq(a, undefined);
        eq(b, undefined);
    });

    ok(catch_called);
    ok(!no_catch_called);

    done(function(){ ok(called); });
};

exports.testErrorHandlersComplex = function(done){

    var h = test_hooker(3);

    h.hook("push_index", function(next){
        next(_.error("TestError", "A test error."));
    });

    var no_catch_called = false;
    h.hook("push_index", function(next){
        no_catch_called = true;
    });

    var catch_called = false;
    h.hook("push_index", function(err, next){
        catch_called = true;
        eq(_.code(err), "TestError");
        next(err);
    }, true);

   var second_catch_called = false;
    h.hook("push_index", function(err, next){
        second_catch_called = true;
        eq(_.code(err), "TestError");
        next();
    }, true);

    var no_catch_called_after_swallow = false;
    h.hook("push_index", function(next){
        no_catch_called_after_swallow = true;
    });

    var called = false;

    h.bite("push_index", [[],[]], function(err, a, b){
        eq(_.code(err), "TestError");
        ok(err.swallowed);
        eq(a, undefined);
        eq(b, undefined);
        called = true;
    });

    ok(catch_called);
    ok(!no_catch_called);
    ok(second_catch_called);
    ok(!no_catch_called_after_swallow);

    done(function(){ eq(called, true); });
};

exports.testTimeout = function(done){
    var h = test_hooker(3);

    h.hook("push_index", function(next, a, b){ });

    var called = false;

    h.bite("push_index", [[],[]], function(err, a, b){
        called = true;
        eq(_.code(err), "Timeout");
        eq(a, undefined);
        eq(b, undefined);
    }, 200);

    done(function(){ ok(called); });
};

exports.testRemove = function(done){
    function hooker(){};
    _.hook(hooker.prototype);
 
    var callbacks = 0;

    function test(hooker){
        var calls = 0;
        var beforeCalls = 3;
        var afterCalls = 1;
        
        var handler = function(next){ calls++; next(); }
        
        hooker.hook('test', handler);
        hooker.hook('test', handler);
        hooker.hook('test', function(next){ calls++; next(); });
        
        hooker.bite('test', function(){
            eq(calls, beforeCalls);

            calls = 0;

            hooker.unhook('test', handler);

            hooker.bite('test', function(){
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
    function hooker(){};
    _.hook(hooker.prototype);
    
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
        
        hooker.bite('test', [e, f], function(err){
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
