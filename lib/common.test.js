"use strict";

var _ = require('../');

var eq = _.test.eq;
var ok = _.test.ok;

var test_hash_key_performance = false;

suite('common');

test("deep_equal", function(){
    eq(false, _.deep_equal({ blah: true }, { blah: false }));
    eq(false, _.deep_equal({ blah: "" }, { blah: false }));
    eq(true, _.deep_equal({ blah: "" }, { blah: false }, false));
});

test("s", function(){
    eq("", _.s());
    eq("null", _.s(null));
    eq("abc", _.s("abc"));
    eq("2", _.s(2));
    eq("{ o: { a: [] }, a: [ {}, {} ] }", _.s({ o: { a: [] }, a: [{}, {}] }));
});

test("sorn", function(){
    function test(f){
        eq("abc", f("abc"));
        eq("2", f(2));
        eq("0", f(0));
        eq("", f(""));
        eq(null, f());
        eq(null, f(null));
        eq(null, f({ o: { a: [] }, a: [{}, {}] }));
        eq(null, f([]));
    }
    test(_.sorn);
});

test("iso_date", function(){
    var now = _.date();
    eq(_.iso_date(), _.iso_date(now));

    var d = _.moment("2015-02-12").toDate();
    eq(_.iso_date(_.iso_date(d)).valueOf(), d.valueOf());

    eq(_.iso_date("2015-02-22").minutes(), 0);
    eq(_.iso_date("2015-02-22").hours(), 0);
    eq(_.iso_date("2015-02-22").seconds(), 0);
    eq(_.iso_date("2015-02-22").milliseconds(), 0);

    eq(_.iso_date(" 2015-02-22"), null);
    eq(_.iso_date("use strict 2015-02-22"), null);

    eq(_.iso_date(""), null);
    eq(_.iso_date("blah"), null);
    eq(_.iso_date("2015-22-22"), null);

    var now_la = _.moment.tz("America/Los_Angeles");
    var now_la_iso_date = now_la.format("YYYY-MM-DD");
    eq(now_la_iso_date, _.iso_date("America/Los_Angeles"));

    _.p("tonga date: ", _.iso_date("Pacific/Tongatapu"));
    _.p("tonga time: ", _.moment.tz("Pacific/Tongatapu").format());
    _.p("samoa date: ", _.iso_date("Pacific/Samoa"));
    _.p("samoa time: ", _.moment.tz("Pacific/Samoa").format());
    _.p(_.iso_date("Pacific/Tongatapu") + " !== " + _.iso_date("Pacific/Samoa"));

    ok(_.iso_date("Pacific/Tongatapu") !== _.iso_date("Pacific/Samoa"))
});

test("to_number", function(){
    function to_number_f_test(f){
        eq(f('not a number'), null);
        eq(f(0), 0);
        eq(f(-2), -2);
        eq(f('-2'), -2);
        eq(f(2.3446), 2.3446);
        eq(f('2.3446'), 2.3446);
        eq(f('-2.3446'), -2.3446);
        eq(f('0'), 0);
        eq(f('0.0'), 0);
        eq(f('0.1'), 0.1);
        eq(f(('0.1'), 1), "0.1");
        eq(f(('  0.1 '), 1), "0.1");
        eq(f('0000'), 0);
        eq(f('2.345'), 2.345);
        eq(f('2.345', NaN), "2");
        eq(f('2.345', 2), "2.35");
        eq(f('2.344', 2), "2.34");
        eq(f('2', 2), "2.00");
        eq(f(2, 2), "2.00");
        eq(f(''), null);
        eq(f(null), null);
        eq(f(undefined), null);
        eq(f(), null);
        eq(f("1b2c3"), null);
        eq(f("a1b2c3"), null);
    }

    to_number_f_test(_.toNumber);
    to_number_f_test(_.to_number);
    to_number_f_test(_.n);
});

test("numbers", function(){

    // using an object is undefined behavior
    eq(_.numbers({ "a": "a", "b": "b", "c": "c" }), [])

    eq(_.numbers(""), "")
    eq(_.numbers(), "")
    eq(_.numbers([]), [])
    eq(_.numbers(["a", "b", "c"]), [])
    eq(_.numbers("no numbers"), "")
    eq(_.numbers("a1b2c3d4 f5 +6,789--10"), "12345678910")
    eq(_.numbers(["a", "1", "b", "2","c", 3, "d4", "f5 +6,789--10"]), ["1", "2", 3]);

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

    var timer = _.time("each.async");

    process.maxTickDepth = 1000 * 1000;
    _.p(process.maxTickDepth);
    var a = _.range(1000 * 10000);

    _.each.async(a, function(val, i, next){
        next();
    }, function(){
        timer();
    });

    done();
});
*/

test('each.async empty', function(done){
    _.each.async([], function(){ }, function(){ 
        done();
    });
});

test("error", function(){

    var e = _.error("ACode", "AMessage");

    eq(e.code, "ACode");
    eq(e.message, "AMessage");

    eq(true, _.code(e, e));
    eq(true, _.code("ACode", e));
    eq(true, _.code(e, "ACode"));
    eq(false, _.code(e, "BCode"));
    eq(false, _.code("BCode", e));


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
});

test("errors", function(){

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
});

test("duration_string", function(){
    eq("0:00:01", _.seconds.durationString(1));
    eq("0:01:01", _.seconds.duration_string(61));
    eq("1:01:01", _.seconds.durationString(3661));
});


test("partial", function(){

    function a(){ return(arguments); }

    var f = _.partial(a, 1, _, 3);

    eq(_.a(f(2)),[1, 2, 3]);
});

test("omap", function(){
    var o = { a: 'a', b: 'b', c: 'c' };
    var expected = { "a-a": 1, "b-b": 2, "c-c": 3 };
    eq(expected, _.omap(o, function(cb, val, key){ 
        if(val === 'a'){ val = 1; }
        if(val === 'b'){ val = 2; }
        if(val === 'c'){ val = 3; }
        cb(val, key + "-" + key);
    }));
});

test("plumb", function(){

    var calls = 0;
    var expectedCalls = 15;

    function throws(callback){ callback(_.error("BadError", "bad error.")); }

    function abc(callback){ callback(null, 'a', 'b', 'c'); }

    function invalidCall(){ throw(_.exception("BadCall", "Unexpected call.")); }

    function returnsFalse(){ return(false); }
    function returnsTrue(){ return(true); };

    var expectsError = function(err){ eq(true, _.code("BadError", err)); eq(arguments.length, 1); calls++; }
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

    eq(calls, expectedCalls);
});

test("property_comparer", function(){
    var comp = _.propertyComparer("z");

    var foo = {z: "foo"}
    var bar = {z: "bar"}
    var baz = {z: "baz"}
    var untrue = {z: false}

    eq(comp(foo), "foo");
    eq(true, comp(foo, "foo"));
    eq(false, comp(foo, "bar"));
    eq(true, comp(foo, "foo", "bar"));
    eq(true, comp(foo, "bar", "foo"));
    eq(true, comp(foo, "bar", "baz", "foo"));

    eq(false, comp(foo, ["bar", "baz", "foo"]));
    eq(false, comp(foo, "bar", ["baz", "foo"]));

    comp = _.property_comparer("z");

    eq(false, comp());
    eq(false, comp(null));
    eq(false, comp(false));
    eq(true, comp("foo", foo));
    eq(true, comp(untrue, false));
    eq(true, comp(foo, foo));
    eq(true, comp(bar, baz, bar));
    eq(true, comp(foo, baz, "foo", bar));
    eq(false, comp(bar, baz, "foo", foo));
    eq(false, comp(bar, baz, foo));
    eq(false, comp(bar, baz, foo));
});

test("code", function(){

    var foo = {z: "foo"}
    var bar = {z: "bar"}
    var baz = {z: "baz"}

    eq(false, _.code.noent(null));
    eq(false, _.code.notdir(null));
    eq(true, _.code.noent({code:"ENOENT"}));
    eq(true, _.code.noent({code:"MODULE_NOT_FOUND"}));
    eq(true, _.code.notdir({code:"ENOTDIR"}));
    eq(false, _.code.noent({code:"ENOTDIR"}));
    eq(false, _.type({code:"ENOTDIR"}, "error"));
    eq(false, _.type({code:"ENOTDIR"}, "exception"));
    eq(false, _.type({type:'error', code:"foo"}, "exception"));
    eq(true, _.type({type:'exception', code:"foo"}, "exception"));
    eq(false, _.type({type:'error', code:"foo"}, "exception"));
});

test("minutes", function(){

    eq(_.minutes.hour(), 60);
    eq(_.minutes.hour(2), 120);

    eq(_.minutes.time_string(60), "1:00 AM");
    eq(_.minutes.time_string((60 * 24) + 60), "1:00 AM");
    eq(_.minutes.time_string(60, true), "1:00");
    eq(_.minutes.time_string((48 * 60) + 60, true), "1:00");
    eq(_.minutes.time_string((48 * 60) + 60, false), "1:00 AM");

    eq(_.minutes.time_string((13 * 60), true), "13:00");
    eq(_.minutes.time_string((13 * 60), false), "1:00 PM");
    eq(_.minutes.time_string((13 * 60), false), "1:00 PM");

});

test("human_duration", function(){

    eq(_.minutes.human_duration(60), "1 hour");
    eq(_.minutes.humanDuration(60), "1 hour");
    eq(_.minutes.human_duration(120), "2 hours");
    eq(_.minutes.human_duration(10), "10 minutes");
    eq(_.minutes.human_duration(70), "1 hour 10 minutes");
    eq(_.minutes.human_duration(130), "2 hours 10 minutes");
    eq(_.minutes.human_duration(121), "2 hours 1 minute");
    eq(_.minutes.human_duration(1), "1 minute");

});


test("rmap", function(){
    var expected = [1, 2, 3, 6];

    var first = true
    eq(expected, _.rmap([0, 1, 2, 3], function(a){
        if(first){
            first = false;
            return(a*2);
        }else{ return(a+1); }
    }));
});

test("rfilter", function(){

    var expected = [0, 1, 3];

    var iter = 0;
    eq(expected, _.rfilter([0, 1, 2, 3], function(a){
        if(iter++ === 1){
            return(false);
        }else{ return(true); }
    }));
});

test("for", function(){

    var actual = 0;
    var expected = 100;

    _.for(100, function(){ actual++; });

    eq(actual, expected);

    actual = 0;
    expected = 50;

    _.for(100, function(i){  if(i == 50){ return(false); } actual++; });

    eq(actual, expected);

});

test("map.async", function(done){

    var called = 0;

    var a = [1, 2, 3, 4, 5, 6];

    _.map.async(a, function(val, i, next){

        _.nextTick(function(){ next(val*2); });

    }, function(result){
        eq(result, [2, 4, 6, 8, 10, 12]);
        done();
    });
});

test("filter.async", function(done){

    var called = 0;

    var a = [1, 2, 3, 4, 5, 6];

    _.filter.async(a, function(val, i, next){

        _.nextTick(function(){ next(val < 4); });

    }, function(result){
        eq(result, [1, 2, 3]);
        done();
    });
});

test("moment", function(){ ok(_.moment().format("YYYY-MM-DD")); });
test("moment_timezones", function(){ ok(_.moment().tz("America/Los_Angeles")); });

test("hash_key_performance", function(){
    if(!test_hash_key_performance){ return; }

    var iterations = 10 * 1000;

    function test_hash(key){
        var h = {};
        var timer = _.time("key length: " + _.byte_units(key.length));
        for(var i = 0; i < iterations; i++){
            h[key] = i + (i-1);
        }
        timer();
    }

    test_hash(Array(10).join('a'));
    test_hash(Array(100).join('a'));
    test_hash(Array(1000).join('a'));
    test_hash(Array(10000).join('a'));
    test_hash(Array(100000).join('a'));
    test_hash(Array(1000000).join('a'));
});

test("fatal", function(){

    try{
        _.fatal("should be pretty: a b c", {'a':'b','c':'d'}, ['a', 'b', 'c', 'd']);
    }catch(e){ return ok(true); }

    return ok(false);
});

test("handlebars", function(){

    var data = {"person": { "name": "Alan" }, "company": {"name": "Rad, Inc." } };
    var template = "{{person.name}} - {{company.name}}";
    // var pre = _.time("pre");
    eq("Alan - Rad, Inc.", _.render.once(template, data));
    // pre();

    // var post = _.time("post");
    eq("Alan - Rad, Inc.", _.render.once(template, data));
    // post();

    _.render.loadDirectory("./test/testTemplates");

    _.render.loadFile("single", "./test/test.hb");
    _.render.loadFile("singleTwo", "./test/test.hb");
    eq(_.render("single", { data: "hello" }), "hello");
    eq(_.render("singleTwo", { data: "hello" }), "hello");
    eq(_.render("testTemplate", { data: "hello" }), "hello");
    eq(_.render("testTemplateTwo", { data: "hello" }), "hello");

});

test("format", function(){
    eq("should be pretty: a b c { a: 'b', c: 'd' } [ 'a', 'b', 'c', 'd' ]", _.format("should be pretty: a b c", {'a':'b','c':'d'}, ['a', 'b', 'c', 'd']));
});

test("concat", function(){
    eq(_.concat(['a'], 'b', 'c', ['d', 'e']), ['a', 'b', 'c', 'd', 'e']);
});

test("escape_regex", function(){
    eq(_.escape_regex("$[]//"), "\\$\\[\\]\\/\\/");

    var test_string = "$[$$]$[//\\\\";
    ok(test_string.match(_.regex("^" + _.escape_regex(test_string) + "$")));
});


test("basic_type", function(){
    eq(_.basic_type(), 'undefined');
    eq(_.basic_type(null), 'null');
    eq(_.basic_type("a"), 'string');
    eq(_.basic_type(0), 'number');
    eq(_.basic_type(["a"]), 'array');
    eq(_.basic_type([0]), 'array');
    eq(_.basic_type({}), 'object');
});

function test_type_output(f){

    var t = { type : 't' };
    var x = { type : 'x' };

    eq(f(), 'undefined');
    eq(f(null), 'null');
    eq(f("a"), 'string');
    eq(f(0), 'number');
    eq(f(["a"]), 'array');
    eq(f([0]), 'array');
    eq(f({}), 'object');
    eq(f(t), 't');
    eq(f(x), 'x');
    eq(f([t, x]), 'array');
}

test("dry_type", function(){
    test_type_output(_.dry_type);
});

function test_types_output(f){

    var t = { type : 't' };
    var x = { type : 'x' };

    eq(f(), 'undefined');
    eq(f(null), 'null');
    eq(f("a"), 'string');
    eq(f(0), 'number');
    eq(f(["a"]), ['string']);
    eq(f([0]), ['number']);
    eq(f([null]), ["null"]);
    eq(f(["a", 1]), ["string", "number"]);
    eq(f({}), 'object');
    eq(f(t), 't');
    eq(f(x), 'x');
    eq(f([x]), ['x']);
    eq(f([t]), ['t']);
    eq(f([t, x]), ['t', 'x']);
    eq(f([t, x, t, x]), ['t', 'x']);
    eq(f([x, t, x]), ['x', 't']);

    eq(f(["a", 1, [{}]]), ["string", "number", "array"]);
    eq(f(["a", 1, [{}]], false), ["string", "number", "array"]);
    eq(f(["a", 1, [{}]], true), ["string", "number", ["object"]]);
    eq(f(["a", 1, [[{}, x], ["a", t]]], false), ["string", "number", "array"]);
    eq(f(["a", 1, [[{}, x], ["a", t]]], true), ["string", "number", [["object", "x"], ["string", "t"]]]);
}

test("dry_types", function(){
    test_types_output(_.dry_types);
});

function test_type_match(f){

    var t = { type : 't' };
    var x = { type : 'x' };

    eq(true, f(undefined, 'undefined'));
    eq(true, f(null, 'null'));
    eq(true, f("a", 'string'));
    eq(true, f(0, 'number'));
    eq(true, f(["a"], 'array'));
    eq(true, f([0], 'array'));
    eq(true, f({}, 'object'));
    eq(true, f(t, 't'));
    eq(true, f(x, 'x'));
    eq(false, f(null, 'x'));
    eq(true, f(null, "null", 'x'));
    eq(true, f(x, '*'));
    eq(true, f(undefined, '*'));
    eq(true, f(null, '*'));
    eq(true, f([t, x], 'array'));
    eq(false, f("a", 'array'));
    eq(true, f([t, x], 'object', 'array'));
    eq(true, f([t, x], 'array'));
    eq(false, f([t, x], 'object', 'string'));
    eq(false, f([t, x], ['object', 'string']));
};

test("type_match", function(){
    test_type_match(_.type_match);
});

test("type", function(){
    test_type_output(_.type);
    test_type_match(_.type);
});

test("types_match", function(){
    test_types_match(_.types_match);
});

test("types", function(){
    test_types_output(_.types);
    test_types_match(_.types);
});

function test_types_match(f){

    var t = { type : 't' };
    var x = { type : 'x' };

    eq(true, f(undefined, 'undefined'));
    eq(true, f(null, 'null'));
    eq(true, f("a", 'string'));
    eq(true, f(0, 'number'));
    eq(true, f({}, 'object'));
    eq(true, f(undefined, '*'));
    eq(true, f(null, '*'));
    eq(true, f("a", '*'));
    eq(true, f(0, '*'));
    eq(true, f({}, '*'));
    eq(false, f({}, ['*']));

    eq(true, f(["a"], ['string']));
    eq(true, f([0], ['number']));
    eq(true, f([{}], "string", ['object']));
    eq(true, f(["a"], "number", ['string']));
    eq(true, f(t, 't'));
    eq(true, f(null, "null", 't'));
    eq(true, f(x, 'x', 't'));
    eq(false, f([x], [['x']]));
    eq(true, f([[x]], ['array']));
    eq(true, f([x], ["*"]));
    eq(false, f("abc", ["*"]));
    eq(false, f(x, ["*"]));
    eq(true, f([x, t, 1, 2, "a"], ["*"]));

    eq(false, f("a", 'array'));
    eq(true, f([x], ['t', 'x']));
    eq(true, f([t], ['t', 'x']));
    eq(true, f([t, x], ['t', 'x']));
    eq(true, f([t, x], ['x', 't']));
    eq(true, f([x, x], ['x']));
    eq(false, f([x, x], ['t']));
    eq(true, f([t, t], ['x'], ['t']));
    eq(true, f([x, x], ['x'], ['t']));
    eq(false, f([x, t], ['x'], ['t']));
    eq(false, f([t, x], ['t'], ['x']));
    eq(false, f([t, x], ['object', 'string']));

    eq(false, f([[x, t]], [["*"]]));

    // recursive tests
    eq(true, f([[x, t]], [["*"]], true));
    eq(true, f([[x]], [['x']], true));
    eq(true, f([[x], [t]], [['x'], ['t', 'x']], true));
    eq(true, f([[x], [x]], [['t'], ['t', 'x']], true));
    eq(false, f([[t], [x]], [['t']], true));
    eq(true, f([[t], [x]], [['t'], ['x']], true));
    eq(true, f([[t, x], [x]], [['t', 'x']], true));
    eq(false, f([[x], [t]], [['x']], true));
    eq(true, f([[x], [[t]]], [['x'], [['t']]], true));
    eq(true, f(["string", [x], [[t]]], ["string", ['x'], [['t']]], true));
    eq(false, f(["string", [x], [[t]]], ["string"], true));
}


