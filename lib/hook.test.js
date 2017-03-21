"use strict";

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

suite("hook");

test("testBasic", function(done){

    var h = test_hooker(3);

    h.bite("push_index", [[],[]], function(err, a, b){
        eq(null, err);
        eq(a, [0, 1, 2]);
        eq(b, [0, 1, 2]);
        done();
    });
});

test("testPrototype", function(done){

    function hooker(){};
    _.hook(hooker.prototype);

    hooker.prototype.test = _.hook.fun("test");

    var h = new hooker();

    function handler(next, a){ a.push(a.length); next(); }

    h.test(handler);
    h.test(handler);

    h.bite("test", [[]], function(err, a){
        ok(!err);
        eq(a, [0, 1]);
        done();
    });
});

test("test_error", function(done){

    var h = test_hooker(3);

    h.hook("push_index", function(next){
        next(_.error("test_error", "A test error."));
    });

    var function_after_error_called = false;
    h.hook("push_index", function(next){
        function_after_error_called = true;
    });

    h.bite("push_index", [[],[]], function(err, a, b){
        eq(_.code(err), "test_error");
        eq(a, undefined);
        eq(b, undefined);
        eq(function_after_error_called, false);
        done();
    });

});

test("testErrorHandlersSimple", function(done){

    var h = test_hooker(3);

    h.hook("push_index", function(next){
        next(_.error("test_error", "A test error."));
    });

    var no_catch_called = false;
    h.hook("push_index", function(next){
        no_catch_called = true;
    });

    var catch_called = false;
    h.hook("push_index", function(err, next){
        catch_called = true;
        eq(_.code(err), "test_error");
        next(err);
    }, true);

    h.bite("push_index", [[],[]], function(err, a, b){
        eq(_.code(err), "test_error");
        ok(!err.rewritten);
        ok(!err.swallowed);
        eq(a, undefined);
        eq(b, undefined);
        ok(catch_called);
        ok(!no_catch_called);
        done();
    });
});

test("testErrorRewrite", function(done){

    var h = test_hooker(3);

    h.hook("push_index", function(next){
        next(_.error("test_error", "A test error."));
    });

    var no_catch_called = false;
    h.hook("push_index", function(next){
        no_catch_called = true;
    });

    var catch_called = false;
    h.hook("push_index", function(err, next){
        catch_called = true;
        eq(_.code(err), "test_error");
        next(_.error("rewrite_error", "", err));
    }, true);

    h.bite("push_index", [[],[]], function(err, a, b){
        eq(_.code(err), "rewrite_error");
        ok(err.rewritten);
        eq(_.code(err.original), "test_error");
        eq(a, undefined);
        eq(b, undefined);
        ok(catch_called);
        ok(!no_catch_called);
        done();
    });
});

test("testErrorHandlersComplex", function(done){

    var h = test_hooker(3);

    h.hook("push_index", function(next){
        next(_.error("test_error", "A test error."));
    });

    var no_catch_called = false;
    h.hook("push_index", function(next){
        no_catch_called = true;
    });

    var catch_called = false;
    h.hook("push_index", function(err, next){
        catch_called = true;
        eq(_.code(err), "test_error");
        next(err);
    }, true);

   var second_catch_called = false;
    h.hook("push_index", function(err, next){
        second_catch_called = true;
        eq(_.code(err), "test_error");
        next();
    }, true);

    var no_catch_called_after_swallow = false;
    h.hook("push_index", function(next){
        no_catch_called_after_swallow = true;
    });

    h.bite("push_index", [[],[]], function(err, a, b){
        eq(_.code(err), "test_error");
        ok(err.swallowed);
        eq(a, undefined);
        eq(b, undefined);
        ok(catch_called);
        ok(!no_catch_called);
        ok(second_catch_called);
        ok(!no_catch_called_after_swallow);
        done();
    });
});

test("testErrorHandlersComplex parent", function(done){

    var h = test_hooker(3);

    h.hook("push_index", function(next){
        next(_.error("test_error", "A test error."));
    });

    var no_catch_called = false;
    h.hook("push_index", function(next){
        no_catch_called = true;
    });

    var catch_called = false;
    h.hook("push_index", function(err, next){
        catch_called = true;
        eq(_.code(err), "test_error");
        next(err);
    }, true);

   var second_catch_called = false;
    h.hook("push_index", function(err, next){
        second_catch_called = true;
        eq(_.code(err), "test_error");
        next();
    }, true);

    var no_catch_called_after_swallow = false;
    h.hook("push_index", function(next){
        no_catch_called_after_swallow = true;
    });

    var child = _.hook({});

    child.hook(h);

    child.bite("push_index", [[],[]], function(err, a, b){
        eq(_.code(err), "test_error");
        ok(err.swallowed);
        eq(a, undefined);
        eq(b, undefined);
        ok(catch_called);
        ok(!no_catch_called);
        ok(second_catch_called);
        ok(!no_catch_called_after_swallow);
        done();
    });
});


test("testTimeout", function(done){
    var h = test_hooker(3);

    h.hook("push_index", function(next, a, b){ });

    h.bite("push_index", [[],[]], function(err, a, b){
        eq(_.code(err), "timeout");
        eq(a, undefined);
        eq(b, undefined);
        done();
    }, 200);

});

test("testRemove", function(done){

    var hooker = _.hook({});

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
            done();
        });

    });
});

test("testAppendToObject", function(done){
    function hooker_class(){};
    _.hook(hooker_class.prototype);

    var hooker = new hooker_class();
    
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

        done();
    });
    
});

test("testParentGood", function(done){

    function hooker(){}
    _.hook(hooker.prototype);

    var grand_parent = new hooker();

    grand_parent.hook("append", function(next, a, b){
        a.push('agp0');
        b.push('bgp0');
        next();
    });

    var parent = new hooker();

    parent.hook(grand_parent);

    parent.hook("append", function(next, a, b){
        a.push('ap0');
        b.push('bp0');
        next();
    });

     parent.hook("append", function(next, a, b){
        a.push('ap1');
        b.push('bp1');
        next();
    });
    
    var child = new hooker();

    child.hook(parent);
        
    child.hook("append", function(next, a, b){ 
        a.push("ac0");
        b.push("bc0");
        next();
    });

    child.hook("append", function(next, a, b){ 
        a.push("ac1");
        b.push("bc1");
        next();
    });

    var result_a = [];
    var result_b = [];
    var expected_a = ["agp0", "ap0", "ap1", "ac0", "ac1"];
    var expected_b = ["bgp0", "bp0", "bp1", "bc0", "bc1"];

    child.bite('append', [result_a, result_b], function(err){
        eq(result_a, expected_a);
        eq(result_b, expected_b);
        done();
    });
});


/*
test("testParallel", function(done){
    
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
});
*/
