var assert = require('assert');
var _ = require('../');

function hooker(){};
_.hook(hooker.prototype);

var eq = _.test.eq;

exports.testCall = function(done){

    var callbacks = 0;
    
    function test(emitter){
        var calls = 0;
        var expectedCalls = 2;
        
        var handler = function(next){ calls++; next(); }
        
        hooker.hook('test', handler);
        hooker.hook('test', handler);
        
        hooker.bite('test', 1, 2, 3, function(){
            callbacks++;
        });
        
        eq(calls, expectedCalls);
    }
    
    test(new hooker());

    done(function(){
        eq(callbacks, 1);
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
        
        hooker.bite('test', function(){
            eq(calls, expectedCalls);
            callbacks++;
        });
        
    }
    
    test(new hooker());
    test(_.hook({}));

    done(function(){
        eq(callbacks, 2);
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
        hooker.hook('test', function(next){ calls++; next(); });
        
        hooker.bite('test', e, f, function(){
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

