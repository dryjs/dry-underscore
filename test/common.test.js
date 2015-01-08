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
exports.testPlumber = testPlumber;
exports.testOmap = testOmap;
exports.testError = testError;
exports.testCode = testCode;
exports.testBail = testBail;
exports.testPropertyComparer = testPropertyComparer;
exports.testPartial = testPartial;
exports.testEach = testEach;
exports.testSeconds = testSeconds;
exports.testErrors = testErrors;
//exports.hashTest = hashTest;
//exports.testFatal = testFatal;

function testErrors(){

    var errors = _.errors();

    errors.add("failure", "failure");
    errors.add("error", "error");


    eq(_.code(errors.failure()), "failure");
    eq(errors.failure().message, "failure");

    eq(_.code(errors.error()), "error");
    eq(errors.error().message, "error");

    eq(_.code(errors.error("new message")), "error");
    eq(errors.error("new message").message, "new message");

    var e = errors.error("new message", { message: "foo", code: "foo", extra: 'extra' });

    eq(_.code(e), "error");
    eq(e.message, "new message");
    eq(e.extra, "extra");

    var z = errors.error({ message: "foo", code: "foo", extra: 'extra' });

    eq(_.code(z), "error");
    eq(z.message, "error");
    eq(z.extra, "extra");

    eq(errors.hash(), { 
        failure: "failure",
        error: "error" 
    });

    errors.hash({ foo: "foo" });

    eq(_.code(errors.foo()), "foo");
    eq(errors.foo().message, "foo");

}


function testSeconds(){

    eq("0:00:01", _.seconds.durationString(1));
    eq("0:01:01", _.seconds.durationString(61));
    eq("1:01:01", _.seconds.durationString(3661));

}

function testEach(){

    function f(){}

    f.prop = true;

    var seen = false;
    _.each(f, function(val, key){
        if(key === "prop" && val === true){
            seen = true;
        }
    });
        
    ok(seen);
}


function testPartial(){

    function a(){ return(arguments); }

    var f = _.partial(a, 1, _, 3);

    eq(_.a(f(2)),[1, 2, 3]);
}


function testBail(beforeExit){
    var bailCalls = 0;
    (_.bail(function(){
        eq(arguments.length, 0);
        bailCalls += 1;
   }, function(){
        eq(arguments.length, 0);
        bailCalls += 2;
   }, function(a, b){
        eq(a, "a");
        eq(b, "b");
        bailCalls += 4;
   }))("a", "b");

    beforeExit(function(){ 
        eq(bailCalls, 7);
    });
}


function testOmap(){
    var o = { a: 'a', b: 'b', c: 'c' };
    var expected = { "a-a": 1, "b-b": 2, "c-c": 3 };
    eq(expected, _.omap(o, function(cb, val, key){ 
        if(val === 'a'){ val = 1; }
        if(val === 'b'){ val = 2; }
        if(val === 'c'){ val = 3; }
        cb(val, key + "-" + key);
    }));
}

function testPlumber(beforeExit){
    var calls = 0;
    var expectedCalls = 15;

    function throws(callback){ callback(_.error("BadError", "bad error.")); }

    function abc(callback){ callback(null, 'a', 'b', 'c'); }

    function invalidCall(){ throw(_.exception("BadCall", "Unexpected call.")); }

    function returnsFalse(){ return(false); }
    function returnsTrue(){ return(true); };

    var expectsError = function(err){ ok(_.code("BadError", err)); eq(arguments.length, 1); calls++; }
    var expectsGood = function(err, a, b, c){ ok(!err); eq(a, 'a'); eq(b, 'b'); eq(c, 'c'); calls++; }

    throws(_.plumb(invalidCall, expectsError));
    abc(_.plumb(function(a, b, c){ eq(a, 'a'); eq(b, 'b'); eq(c, 'c'); calls++; }, invalidCall));

    throws(_.plumb(invalidCall, expectsError, "OtherError"));
    throws(_.plumb(invalidCall, expectsError, ["OtherError"]));
    throws(_.plumb(invalidCall, expectsError, returnsFalse));
    throws(_.plumb(invalidCall, expectsError, [returnsFalse]));

    abc(_.plumb(expectsGood, invalidCall, "OtherError"));
    abc(_.plumb(expectsGood, invalidCall, ["OtherError", "NotherError"]));
    abc(_.plumb(expectsGood, invalidCall, returnsFalse));
    abc(_.plumb(expectsGood, invalidCall, [returnsFalse]));
    abc(_.plumb(expectsGood, invalidCall, ["OtherError", returnsFalse]));

    throws(_.plumb(expectsError, invalidCall, "BadError"));
    throws(_.plumb(expectsError, invalidCall, ["OtherError", "BadError"]));
    throws(_.plumb(expectsError, invalidCall, returnsTrue));
    throws(_.plumb(expectsError, invalidCall, [returnsFalse, returnsTrue]));

    beforeExit(function(){ eq(calls, expectedCalls); });
}

function testPropertyComparer(){
    var comp = _.propertyComparer("z");

    var foo = {z: "foo"}
    var bar = {z: "bar"}
    var baz = {z: "baz"}

    eq(comp(foo), "foo");
    ok(comp(foo, "foo"));
    ok(!comp(foo, "bar"));
    ok(comp(foo, "foo", "bar"));
    ok(comp(foo, "bar", "foo"));
    ok(comp(foo, "bar", "baz", "foo"));

    ok(!comp());
    ok(!comp(null));
    ok(!comp(false));
    ok(comp("foo", foo));
    ok(comp(foo, foo));
    ok(comp(bar, baz, bar));
    ok(comp(foo, baz, "foo", bar));
    ok(!comp(bar, baz, "foo", foo));
    ok(!comp(bar, baz, foo));
}

function testCode(){

    var foo = {z: "foo"}
    var bar = {z: "bar"}
    var baz = {z: "baz"}

    ok(!_.code.noent(null));
    ok(!_.code.notdir(null));
    ok(_.code.noent({code:"ENOENT"}));
    ok(_.code.noent({code:"MODULE_NOT_FOUND"}));
    ok(_.code.notdir({code:"ENOTDIR"}));
    ok(!_.code.noent({code:"ENOTDIR"}));
    ok(!_.type("error", {code:"ENOTDIR"}));
    ok(!_.type("exception", {code:"ENOTDIR"}));
    ok(!_.type("exception",  {type:'error', code:"foo"}));
    ok(_.type("exception",  {type:'exception', code:"foo"}));
    ok(!_.type("exception", {type:'error', code:"foo"}));
    ok(!_.type('exception', {type:'error', code:"foo"}, bar, baz));
}

function testError(){

    var e = _.error("ACode", "AMessage");

    eq(e.code, "ACode");
    eq(e.message, "AMessage");

    ok(_.code(e, e));
    ok(_.code("ACode", e));
    ok(_.code(e, "ACode"));
    ok(!_.code(e, "BCode"));
    ok(!_.code("BCode", e));


    var foo = _.error("FooCode", "FooMessage", { message: "BarMessage", code: "BarCode", barExtra: "BarExtra" });

    eq(foo.code, "FooCode");
    eq(foo.message, "FooMessage");
    eq(foo.originalMessage, "BarMessage");
    eq(foo.originalCode, "BarCode");
    eq(foo.barExtra, "BarExtra");

    var zoo = _.error("ZooCode", { message: "ZooMessage", code: "NewZooCode", zooExtra: "ZooExtra" }, { message: "BarMessage", code: "BarCode", barExtra: "BarExtra" });

    eq(zoo.code, "ZooCode");
    eq(zoo.message, "ZooMessage");
    eq(zoo.originalMessage, "BarMessage");
    eq(zoo.originalCode, "BarCode");
    eq(zoo.zooExtra, "ZooExtra");
    eq(zoo.barExtra, "BarExtra");
}

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

    f(2, 2, function(a, b, c){
        eq(a, 2);
        eq(b, 2);
        eq(c, 3);
        called++;
    }, 3);

    f(2, 2, function(a, b, c){
        eq(a, 2);
        eq(b, 2);
        eq(c, 3);
        called++;
    }, 3);

    beforeExit(function(){ 
        eq(expensiveCalled, 2);
        eq(called, 5);
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


