"use strict";

var path = require('path');
var assert = require('assert');

var _ = require('../');
var eq = _.test.eq;
var ok = _.test.ok;

exports.testHasType = testHasType;
exports.testHasTypes = testHasTypes;
//exports.testIterateAsync = testIterateAsync;
exports.testEmptyIterate = testEmptyIterate;
exports.testGet = testGet;
exports.testTest = testTest;
exports.testFormat = testFormat;
exports.testConcat = testConcat;
exports.testMoment = testMoment;
exports.testHandleBars = testHandleBars;
exports.testMapAsync = testMapAsync;
exports.testFilterAsync = testFilterAsync;
exports.testRmap = testRmap;
exports.testRfilter = testRfilter;
exports.testMemoizeAsync = testMemoizeAsync;
exports.testFor = testFor;
exports.testTimeout = testTimeout;
//exports.hashTest = hashTest;
//exports.testFatal = testFatal;
//exports.random = function(){ _.stderr(_.sha256(_.uuid())); };
/*
exports.testRequest = function(){
    _.request('localhost/test', function(req){
        _.stderr(req);
    });
};
*/

function testRmap(){
    var expected = [1, 2, 3, 6];

    var first = true
    eq(expected, _.rmap([0, 1, 2, 3], function(a){
        if(first){
            first = false;
            return(a*2);
        }else{ return(a+1); }
    }));
}

function testRfilter(){

    var expected = [0, 1, 3];

    var iter = 0;
    eq(expected, _.rfilter([0, 1, 2, 3], function(a){
        if(iter++ === 1){
            return(false);
        }else{ return(true); }
    }));
}

function testMemoizeAsync(beforeExit){

    var called = 0;
    var expensiveCalled = 0;

    var f = _.memoize.async(function(a, b, cb, c){
        expensiveCalled++;
        _.nextTick(function(){ cb(a, b, c); });
    });

    f(1, 2, function(a, b, c){
        eq(a, 1);
        eq(b, 2);
        eq(c, 3);
        called++;
    }, 3);

    f(1, 2, function(a, b, c){
        eq(a, 1);
        eq(b, 2);
        eq(c, 3);
        called++;
    }, 3);

    f(1, 2, function(a, b, c){
        eq(a, 1);
        eq(b, 2);
        eq(c, 3);
        called++;
    }, 3);

    beforeExit(function(){ 
        eq(expensiveCalled, 1);
        eq(called, 3);
    });
}

function testTimeout(beforeExit){

    var successCalled = 0;
    var errorCalled = 0;

    function goodSuccess(){ successCalled++; };
    function goodError(){ errorCalled++; };
    function badSuccess(){ _.fatal("shouldn't be called."); }
    function badError(){ _.fatal("shouldn't be called."); }

    setTimeout(_.timeout(goodSuccess, badError, 100), 20);
    setTimeout(_.timeout(badSuccess, goodError, 100), 200);

    function withArgs(callback, t){ 
        setTimeout(function(){
            callback(1, 2, 3);
        }, t);
    }

    withArgs(_.timeout(function(a, b, c){ eq(a, 1); eq(b, 2); eq(c, 3);  successCalled++ }, badError, 100), 20);
    setTimeout(_.timeout(badSuccess, function(err){ errorCalled++; ok(err.add); }, 100, {add: true}), 200);

    beforeExit(function(){ 
        eq(successCalled, 2);
        eq(errorCalled, 2);
    });

}

function testFor(){

    var actual = 0;
    var expected = 100;

    _.for(100, function(){ actual++; });

    eq(actual, expected);

    actual = 0;
    expected = 50;

    _.for(100, function(i){  if(i == 50){ return(false); } actual++; });

    eq(actual, expected);
}

function testMapAsync(beforeExit){

    var called = 0;

    var a = [1, 2, 3, 4, 5, 6];

    _.map.async(a, function(val, i, next){

        _.nextTick(function(){ next(val*2); });

    }, function(result){
        eq(result, [2, 4, 6, 8, 10, 12]);
        called++;
    });

    beforeExit(function(){ eq(called, 1); });
}

function testFilterAsync(beforeExit){

    var called = 0;

    var a = [1, 2, 3, 4, 5, 6];

    _.filter.async(a, function(val, i, next){

        _.nextTick(function(){ next(val < 4); });

    }, function(result){
        eq(result, [1, 2, 3]);
        called++;
    });

    beforeExit(function(){ eq(called, 1); });
}



function testHandleBars(){
    _.log.level("info");

    var data = {"person": { "name": "Alan" }, "company": {"name": "Rad, Inc." } };
    var template = "{{person.name}} - {{company.name}}";
    // _.time("pre");
    eq("Alan - Rad, Inc.", _.render.once(template, data));
    // _.time("pre", true);

    // _.time("post");
    eq("Alan - Rad, Inc.", _.render.once(template, data));
    // _.time("post", true);

    _.render.loadDirectory("./test/testTemplates");

    _.render.loadFile("single", "./test/test.hb");
    _.render.loadFile("singleTwo", "./test/test.hb");
    eq(_.render("single", { data: "hello" }), "hello");
    eq(_.render("singleTwo", { data: "hello" }), "hello");
    eq(_.render("testTemplate", { data: "hello" }), "hello");
    eq(_.render("testTemplateTwo", { data: "hello" }), "hello");
};

function testMoment(){ ok(_.moment().format("YYYY-MM-DD")); }

function hashTest(){
    var iterations = 100 * 1000;
    var iterations = 10000;

    function testHash(key){
        var h = {};
        _.time("key length: " + _.byteUnits(key.length));
        for(var i = 0; i < iterations; i++){
            h[key] = i + (i-1);
        }
        _.time("key length: " + _.byteUnits(key.length), true);
    }

    testHash(Array(10).join('a'));
    testHash(Array(100).join('a'));
    testHash(Array(1000).join('a'));
    testHash(Array(10000).join('a'));
    testHash(Array(100000).join('a'));
    testHash(Array(1000000).join('a'));
}

function testFatal(){
    _.fatal("should be pretty: a b c", {'a':'b','c':'d'}, ['a', 'b', 'c', 'd']);
}

function testFormat(){
    assert.eql("should be pretty: a b c { a: 'b', c: 'd' } [ 'a', 'b', 'c', 'd' ]", _.format("should be pretty: a b c", {'a':'b','c':'d'}, ['a', 'b', 'c', 'd']));
}

function testConcat(){
    assert.deepEqual(_.concat(['a'], 'b', 'c', ['d', 'e']), ['a', 'b', 'c', 'd', 'e']);
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
    assert.strictEqual(_.get({ 'a': function(){ return('b'); }}, 'a'), 'b');
    assert.strictEqual(_.get({ 'A': 'b'}, 'a'), 'b');
    assert.strictEqual(_.get(['a', 'b'], 1), 'b');
    assert.strictEqual(_.get(['a', 'b'], 1), 'b');
    assert.strictEqual(_.get({ 'A': 'b'}, 'c'), undefined);
    assert.strictEqual(_.get(function(){ return('a'); }), 'a');

    var z = {'a': 'b'};
    _.get(z, 'c', {}).c = 'c';
    assert.deepEqual(z, {'a' : 'b', 'c' : {'c' : 'c'}});
}

function testEmptyIterate(beforeExit){

    var called = 0;

    _.each.async([], function(){ }, function(){ called++; });

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
        _.each.async(a, function(index, val, next){
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


