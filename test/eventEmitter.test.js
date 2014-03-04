var assert = require('assert');
var _ = require('../');

function Emitter(){};
_.eventEmitter(Emitter.prototype);

exports.testDefault = function(){
   function test(emitter){
        var calls = 0;
        var expectedCalls = 2;
        
        var handler = function(){ calls++; }
        
        emitter.on('test', handler);
        emitter.on('test', handler);
        
        emitter.emit('test');
        
        assert.eql(calls, expectedCalls);
    }
    
    test(_);
};

exports.testOn = function(){

    function test(emitter){
        var calls = 0;
        var expectedCalls = 2;
        
        var handler = function(){ calls++; }
        
        emitter.on('test', handler);
        emitter.on('test', handler);
        
        emitter.emit('test');
        
        assert.eql(calls, expectedCalls);
    }
    
    test(new Emitter());
    test(_.eventEmitter({}));
    test(_.eventEmitter());
};

exports.testRemove = function(){
    
    function test(emitter){
        var calls = 0;
        var beforeCalls = 3;
        var afterCalls = 1;
        
        var handler = function(){ calls++; }
        
        emitter.on('test', handler);
        emitter.on('test', handler);
        emitter.on('test', function(){ calls++; });
        
        emitter.emit('test');
        
        assert.eql(calls, beforeCalls);
        
        calls = 0;
        
        emitter.off('test', handler);
        
        emitter.emit('test');
        
        assert.eql(calls, afterCalls);
    }
    
    test(new Emitter());
    test(_.eventEmitter({}));
};

exports.testTagRemove = function(){
    function test(emitter){
        var calls = 0;
        var beforeCalls = 3;
        var afterCalls = 1;
        
        var handler = function(){ calls++; }
        
        emitter.on('test', 'tag', handler);
        emitter.on('test', 'tag', handler);
        emitter.on('test', function(){ calls++; });
        
        emitter.emit('test');
        
        assert.eql(calls, beforeCalls);
        
        calls = 0;
        
        emitter.off('test', 'tag');
        
        emitter.emit('test');
        
        assert.eql(calls, afterCalls);
    }
    
    test(new Emitter());
    test(_.eventEmitter({}));
};

exports.testOnce = function(){
    function test(emitter){
        var calls = 0;
        var beforeCalls = 3;
        var afterCalls = 2;
        
        var handler = function(){ calls++; }
        
        emitter.on('test', handler);
        emitter.on('test', handler);
        emitter.once('test', function(){ calls++; });
        
        emitter.emit('test');
        
        assert.eql(calls, beforeCalls);
        
        calls = 0;
        
        emitter.emit('test');
        
        assert.eql(calls, afterCalls);
    }
    
    test(new Emitter());
    test(_.eventEmitter({}));
};

exports.testOff = function(){
    
    function test(emitter){
        var calls = 0;
        var beforeCalls = 3;
        var afterCalls = 0;
        
        var handler = function(){ calls++; }
        
        emitter.on('test', handler);
        emitter.on('test1', handler);
        emitter.on('test2', function(){ calls++; });
        
        emitter.emit('test');
        emitter.emit('test1');
        emitter.emit('test2');
        
        assert.eql(calls, beforeCalls);
        
        calls = 0;
        
        emitter.off();
        emitter.emit('test');
        
        assert.eql(calls, afterCalls);
    }
    
    test(new Emitter());
    test(_.eventEmitter({}));
};

exports.testOffEvent = function(){
    function test(emitter){
        var calls = 0;
        var beforeCalls = 3;
        var afterCalls = 1;
        
        var handler = function(){ calls++; }
        
        emitter.on('test', handler);
        emitter.on('test', handler);
        emitter.on('test1', function(){ calls++; });
        
        emitter.emit('test');
        emitter.emit('test1');
        
        assert.eql(calls, beforeCalls);
        
        calls = 0;
        
        emitter.off('test');
        emitter.emit('test');
        emitter.emit('test1');
        
        assert.eql(calls, afterCalls);
    }
    
    test(new Emitter());
    test(_.eventEmitter({}));
    
};
