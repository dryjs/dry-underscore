"use strict";

var _ = require('../');

var eq = _.test.eq;
var ok = _.test.ok;

suite('common');

test("s", function(){
    eq("", _.s());
    eq("null", _.s(null));
    eq("abc", _.s("abc"));
    eq("2", _.s(2));
    eq("{ o: { a: [] }, a: [ {}, {} ] }", _.s({ o: { a: [] }, a: [{}, {}] }));
});

test("iso_date", function(){
    var now = _.date();
    eq(_.iso_date(), _.iso_date(now));

    var d = _.moment("2015-02-12").toDate();
    eq(_.iso_date(_.iso_date(d)).valueOf(), d.valueOf());

    eq(_.iso_date("blah"), null);
    eq(_.iso_date("2015-22-22"), null);
});

test("round", function(){

    eq(10.0, _.round(10.4));
    eq(11.0, _.round(10.5));
    eq(10.0, _.round(11.5, 1));
    eq(20.0, _.round(15, 1));
    eq(0.0, _.round(15, 2));
    eq(10.5, _.round(10.46, -1));
    eq(10.46, _.round(10.46, -2));
    eq(10.46, _.round(10.456, -2));
    eq(10.455, _.round(10.4545, -3));

});

test("min", function(){
    eq(null, _.min());
    eq(null, _.min({}));
    eq(null, _.min([]));
    eq(null, _.min([], "a"));
    eq(null, _.min("a", []));
 
    eq(-1, _.min(-1, 1));
    eq("a", _.min("a", "b"));
    eq("a", _.min(["a", "b", "c"]));
    eq(1, _.min([1, 2, 3]));
    eq("-1", _.min(1, "-1"));
    eq(-1, _.min("1", -1));

    eq("2015-01-01", _.min("2015-01-02", "2015-01-01"));
    eq("2014-01-01", _.min("2014-01-01", "2015-01-01"));

    eq({ val: 1 }, _.min([{ val: 1 }, { val: 2 }, { val: 10 }], function(a){ return(a.val); }));
    eq({ val: 1 }, _.min([{ val: 1 }, { val: 2 }, { val: 10 }], "val"));
});

test("max", function(){

    eq(null, _.max());
    eq(null, _.max({}));
    eq(null, _.max([]));
    eq(null, _.max([], "a"));
    eq(null, _.max("a", []));
 
    eq(1, _.max(1, "-1"));
    eq("1", _.max("1", -1));

    eq(1, _.max(-1, 1));
    eq("b", _.max("a", "b"));
    eq("c", _.max(["a", "b", "c"]));
    eq(3, _.max([1, 2, 3]));

    eq("2015-01-02", _.max("2015-01-02", "2015-01-01"));
    eq("2015-01-01", _.max("2014-01-01", "2015-01-01"));

    eq("ten", _.max(["one", "two", "ten"], function(a){ 
        if(a === "one"){ return(1); }
        if(a === "two"){ return(2); }
        if(a === "ten"){ return(10); }
    }));

    eq({ val: 10 }, _.max([{ val: 1 }, { val: 2 }, { val: 10 }], function(a){ return(a.val); }));
    eq({ val: 10 }, _.max([{ val: 1 }, { val: 2 }, { val: 10 }], "val"));
});



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


test('test', function(){
    var n = 0;

    _.test.eq(['a', 'b', 'c'], ['a', 'b', 'c']);
    _.test.eq(['a', 'b', 'c'], ['a', 'b', 'c']);
    try{ _.test.eq(['c', 'c', 'c'], ['a', 'b', 'c']); }catch(e){ n++; }
    _.test.eq([null], [null]);
    try{ _.test.eq([0], [false]); }catch(e){ n++; }
    try{ _.test.eq([0], [null]); }catch(e){ n++; }
    _.test.eq(n, 3);
});

test('define', function(){
    var z = {'a': 'b'};
    _.define(z, 'c', {}).c = 'c';
    eq(z, {'a' : 'b', 'c' : {'c' : 'c'}});
});

test('get', function(){
    eq(_.get({ 'A': 'b'}, 'a'), 'b');
    eq(_.get(['a', 'b'], 1), 'b');
    eq(_.get({ 'A': 'b'}, 'c'), undefined);
    eq(_.get({ 'a': 'b'}, 'a'), 'b');
});

test('each', function(){

    function f(){}

    f.prop = true;

    var seen = false;
    _.each(f, function(val, key){
        if(key === "prop" && val === true){
            seen = true;
        }
    });
        
    ok(seen);
});

test('each.async', function(done){

    var a = _.range(20);

    _.each.async(a, function(val, i, next){
        setTimeout(function(){
            eq(i, _.s(val));
            next();
        }, 10);
    }, function(){
        done();
    });

});

/*
test('each.async depth', function(done){

    throw(_.error("fix_async", "fix each.async to have unlimited stack depth?"));

    _.time("each.async");

    process.maxTickDepth = 1000 * 1000;
    _.p(process.maxTickDepth);
    var a = _.range(1000 * 10000);

    _.each.async(a, function(val, i, next){
        next();
    }, function(){
        _.time("each.async", true);
    });

    done();
});
*/

test('each.async empty', function(done){
    _.each.async([], function(){ }, function(){ 
        done();
    });
});

