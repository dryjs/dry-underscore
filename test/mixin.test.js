var fs = require('fs');
var assert = require('assert');
var _ = require('../');

exports.testEcho = function(beforeExit){
    var n = 0;
    _.shell("echo 'shell is working.'", function(code){
        assert.eql(code, 0);
        n++;
    });
    beforeExit(function(){ assert.eql(n, 1); });
}

exports.testTrimAndStripQuotes = function(){
    assert.eql(_.trimAndStripQuotes("'asdf'"), "asdf");
    assert.eql(_.trimAndStripQuotes('"asdf"'), "asdf");
};

exports.testUnionize = function(){
    var o = { x : 0 };

    function a(b){ b.x++; }
    function b(b){ b.x++; }
    function c(b){ b.x++; }

    _.unionize(a, b, c)(o);

    assert.eql(o.x, 3);
};

exports.testEmptySimpleObject = function(){
    function a(){}
    function b(){}
    b.prototype.testFunction = function(){};
    function c(){ this.prop = true; }

    var a1 = new a();
    var b1 = new b();
    var c1 = new c();
    var d1 = {};
    var d2 = {"prop" : true};

    assert.eql(_.isEmptyObjectWithNoPrototype(a1), true);
    a.prototype.test = function(){};
    assert.eql(_.isEmptyObjectWithNoPrototype(a1), false);
    assert.eql(_.isEmptyObjectWithNoPrototype(b1), false);
    assert.eql(_.isEmptyObjectWithNoPrototype(c1), false);
    assert.eql(_.isEmptyObjectWithNoPrototype(d1), true);
    assert.eql(_.isEmptyObjectWithNoPrototype(d2), false);
};

exports.testFieldStack = function(){

    var testHash = { 
        Type: 'BaseModel',
        Id: '123',
        InstanceId: 10, 
        View: {
            Type: 'BaseModel',
            Id: 'Test',
            View: {
                Type: 'BaseModel',
                Id: 'Test2',
                View: [
                    "zero",
                    1,  
                    {Type: 'BaseModel', Id: 'Test3' },
                    { Type: 'BaseModel',
                        Id: 'Test4',
                        View: {
                            'a' : { 
                                'b' : { 
                                    Type: 'BaseModel',
                                    Id: 'deep'
                                }   
                            }   
                        }   
                    },  
                    "four"
                ]   
            }   
        }                                                                                                                                                                         
    };  
    
    stack = _.fieldStack(testHash);
    //console.dir(stack);

    //_.each(stack, function(val){ console.log(val.fieldName); });
};

exports.testAsyncLockSimple = function(beforeExit){

    var runs = 0;

    function inc(releaseLock){ runs++; process.nextTick(releaseLock); }
    var f = _.asyncLock(inc);
    f();
    f();
    process.nextTick(f);

    beforeExit(function(){ assert.eql(runs, 2); });
}

exports.testAsyncLockExtraTest = function(beforeExit){

    var runs = 0;

    function inc(releaseLock){ runs++; process.nextTick(releaseLock); }
    var disabled = false;

    var f = _.asyncLock(inc, function(def){ return(def || disabled); });
    f();
    f();
    disabled = true;
    process.nextTick(f);
    process.nextTick(f);
    disabled = false;
    process.nextTick(f);

    beforeExit(function(){ assert.eql(runs, 2); });
}

exports.testAsyncLockComplex = function(beforeExit){

    var runs = 0;

    function inc(releaseLock){ runs++; process.nextTick(releaseLock); }
    var disabled = false;
    var locked = false;

    var f = _.asyncLock(inc, function(){ return(disabled || locked); }, function(){ locked = true; }, function(){ locked = false; } );
    f();
    f();
    disabled = true;
    process.nextTick(f);
    process.nextTick(f);
    disabled = false;
    process.nextTick(f);

    beforeExit(function(){ assert.eql(runs, 2); });
}

exports.testJoin = function(){
    assert.eql(_.join_path('a'), "a");
    assert.eql(_.join_path('a', ""), "a");
    assert.eql(_.join_path('a/'), "a/");
    assert.eql(_.join_path('/a/'), "/a/");
    assert.eql(_.join_path('a','b'), "a/b");
    assert.eql(_.join_path('/a','b'), "/a/b");
    assert.eql(_.join_path('a','b/'), "a/b/");
    assert.eql(_.join_path('/a','b/'), "/a/b/");
    assert.eql(_.join_path('a','b','c'), "a/b/c");
    assert.eql(_.join_path('/a','b','c'), "/a/b/c");
    assert.eql(_.join_path('/a','b','c/'), "/a/b/c/");
};

exports.testIsObject = function(){

    assert.ok(!_.isObject(null));
    assert.ok(!_.isObject([]));

    function f(){}
    assert.ok(_.isObject(new f()));
    assert.ok(_.isObject({}));
    assert.eql(['a'], _.clone(['a']));
};

exports.keysTest = function(){
    var a = ['a', 'b', 'c'];
    assert.eql(['0', '1', '2'], _.keys(a));
}

exports.eachAsyncTest = function(beforeExit){
    var called = 0;
    var calledFinished = 0;

    var expectedResultsArray = ['a', 'b', 'c', 'd'];
    var expectedResultsObject = {'a' : true, 'b' : true, 'c' : true, 'd' : true};

    var t1ResultsArray = [];
    var t2ResultsArray = [];
    var t1ResultsObject = [];
    var t2ResultsObject = [];

    function test(o, results, finished){
        _.eachAsync(o, function(val, key, next){
            called++;
            setTimeout(function(){ results[key] = val; next(); }, 10);
        }, finished);
    }

    test(expectedResultsArray, t1ResultsArray, function(){ calledFinished++ });
    test(expectedResultsArray, t2ResultsArray, null);
    test(expectedResultsObject, t1ResultsObject, function(){ calledFinished++ });
    test(expectedResultsObject, t2ResultsObject, null);

    beforeExit(function(){assert.eql(called, 16); assert.eql(calledFinished, 2);});
}

exports.eachTest = function(){

    var a = [{}, {}];

    _.each(a, function(val){
        val.test = true;
    });

    assert.eql(a, [{test: true}, {test: true}]);
};


exports.testWalk = function(){

    var o = {
        "a" : "a",
        "b" : { "c" : "c", "d" : { "e" : "e" } },
        "f" : "f"
    };

    var expectedKeyOrder = ['a', 'b', 'c', 'd', 'e', 'f'];
    var actualKeyOrder = [];

    var expectedValueOrder = ['a', { "c" : "c", "d" : { "e" : "e" } }, "c", { "e" : "e" }, "e", "f"];
    var actualValueOrder = [];

    _.walk(o, function(val, key, o){
        actualKeyOrder.push(key);
        actualValueOrder.push(val);
    });

    assert.eql(actualKeyOrder, expectedKeyOrder);
    assert.eql(actualValueOrder, expectedValueOrder);
};

exports.testSubstitute = function(){
    var start = {
        "a" : "a",
        "b" : { "c" : "c", "d" : { "e" : "e" } },
        "f" : "f",
        "z" : "z"
    };

    var end = {
        "a" : "A",
        "b" : { 'B' : { "D" : "D"}},
        "f" : "C",
        "z" : "z"
    }

    _.substitute(start, function(val, key){
        if(key === 'a'){
            return("A");
        }else if(key === 'b'){
            return({'B' : {'D' : 'd'}});
        }else if(key === 'D'){
            return('D');
        }else if(key === 'f'){
            return('C');
        }
    });

    assert.eql(start, end);
}
