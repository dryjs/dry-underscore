
var path = require('path');
var assert = require('assert');

var _ = require('../');

exports.testHasType = testHasType;
exports.testHasTypes = testHasTypes;
//exports.testIterateAsync = testIterateAsync;
exports.testEmptyIterate = testEmptyIterate;
exports.testGet = testGet;
exports.testTest = testTest;
exports.testFormat = testFormat;
//exports.testFatal = testFatal;

function testFatal(){
    _.fatal("should be pretty: a b c", {'a':'b','c':'d'}, ['a', 'b', 'c', 'd']);
}

function testFormat(){
    assert.eql("should be pretty: a b c { a: 'b', c: 'd' } [ 'a', 'b', 'c', 'd' ]", _.format("should be pretty: a b c", {'a':'b','c':'d'}, ['a', 'b', 'c', 'd']));
}

function testTest(){
    var n = 0;

    _.test.eq(['a', 'b', 'c'], ['a', 'b', 'c']);
    _.test.eq(['a', 'b', 'c'], ['a', 'b', 'c']);
    try{ _.test.eq(['c', 'c', 'c'], ['a', 'b', 'c']); }catch(e){ n++; }
    _.test.eq([null], [null]);
    try{ _.test.eq([0], [false]); }catch(e){ n++; }
    try{ _.test.eq([0], [null]); }catch(e){ n++; }
    _.test.equal(n, 3);
}


function testGet(){

    assert.strictEqual(_.get(function(){ return('a'); }), 'a');
    assert.strictEqual(_.get('a'), 'a');
    assert.strictEqual(_.get({ 'a': 'b'}, 'a'), 'b');
    assert.strictEqual(_.get({ 'A': 'b'}, 'a'), 'b');
    assert.strictEqual(_.get(['a', 'b'], 1), 'b');
    assert.strictEqual(_.get(['a', 'b'], 1), 'b');
    assert.strictEqual(_.get({ 'A': 'b'}, 'c'), undefined);
    assert.strictEqual(_.get(function(){ return('a'); }), 'a');
}

function testEmptyIterate(beforeExit){

    var called = 0;

    _.eachAsync([], function(){ }, function(){ called++; });

    beforeExit(function(){ assert.eql(called, 1); });
}

function testIterateAsync(){
    // stack buster test

    var a = [0];
    var start = a;
    var stackSize = 10000;
    for(var i = 1; i < stackSize; i++){
        var  z = [i];
        start.push(z);
        start = z;
    }
    try{
        recursiveIterate(a, function(result){
            // console.log(JSON.stringify(result));
            // console.log(JSON.stringify(a));
            assert.deepEqual(result, a);
        });
    }catch(e){
        console.dir(e.message);
        // throw(e);
    }
}

function recursiveIterate(a, callback){
    // iterate and recreate array
    var z = [];
    process.nextTick(function() { 
        _.eachAsync(a, function(index, val, next){
            if(Array.isArray(val)){
                recursiveIterate(val, function(r){
                    z.push(r);
                    next();
                });
            }else{
                z.push(val);
                // console.log(val);
                next();
            }
        }, function(){ callback(z) } );
    });
}

function testHasType(){

    var t = {Type : 'T'};
    var x = {Type : 'X'};
    var at = [t, t];
    var ax = [x, x];
    var atx = [t, x];


    assert.strictEqual(0, _.dry.hasType("a", 'string').length);
    assert.strictEqual(0, _.dry.hasType(0, 'number').length);
    assert.strictEqual(1, _.dry.hasType(0, 'string').length);
    assert.strictEqual(1, _.dry.hasType("hello", 'number').length);
    assert.strictEqual(1, _.dry.hasType(["a"], 'string').length);
    assert.strictEqual(1, _.dry.hasType([0], 'number').length);
    assert.strictEqual(0, _.dry.hasType(t, 'T').length);
    assert.strictEqual(0, _.dry.hasType(x, 'X').length);
    assert.strictEqual(1, _.dry.hasType(ax, 'T').length);
    assert.strictEqual(1, _.dry.hasType(atx, 'X').length);
    assert.strictEqual(1, _.dry.hasType(t, 'X').length);
    assert.strictEqual(1, _.dry.hasType(x, 'T').length);
    assert.strictEqual(0, _.dry.hasType(t, ['T', 'X']).length);
    assert.strictEqual(0, _.dry.hasType(x, ['X', 'T']).length);

}

function testHasTypes(){

    var t = {Type : 'T'};
    var x = {Type : 'X'};
    var at = [t, t];
    var ax = [x, x];
    var atx = [t, x];


    assert.strictEqual(1, _.dry.hasTypes("a", 'string').length);
    assert.strictEqual(1, _.dry.hasTypes(0, 'number').length);
    assert.strictEqual(1, _.dry.hasTypes(0, 'string').length);
    assert.strictEqual(1, _.dry.hasTypes("hello", 'number').length);
    assert.strictEqual(0, _.dry.hasTypes(["a"], 'string').length);
    assert.strictEqual(0, _.dry.hasTypes([0], 'number').length);
    assert.strictEqual(1, _.dry.hasTypes(t, 'T').length);
    assert.strictEqual(1, _.dry.hasTypes(x, 'X').length);
    assert.strictEqual(1, _.dry.hasTypes(ax, 'T').length);
    assert.strictEqual(1, _.dry.hasTypes(atx, 'X').length);
    assert.strictEqual(1, _.dry.hasTypes(t, 'X').length);
    assert.strictEqual(1, _.dry.hasTypes(x, 'T').length);
    assert.strictEqual(1, _.dry.hasTypes(t, ['T', 'X']).length);
    assert.strictEqual(1, _.dry.hasTypes(x, ['X', 'T']).length);
    assert.strictEqual(0, _.dry.hasTypes(at, ['T', 'X']).length);
    assert.strictEqual(0, _.dry.hasTypes(ax, ['X', 'T']).length);
    assert.strictEqual(0, _.dry.hasTypes(atx, ['X', 'T']).length);
    assert.strictEqual(0, _.dry.hasTypes(at, 'T').length);
    assert.strictEqual(0, _.dry.hasTypes(ax, 'X').length);
    assert.strictEqual(1, _.dry.hasTypes(ax, 'T').length);
    assert.strictEqual(1, _.dry.hasTypes(at, 'X').length);
    assert.strictEqual(1, _.dry.hasTypes(atx, ['T']).length);

}


