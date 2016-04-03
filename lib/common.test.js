"use strict";

if(typeof require !== "undefined"){
    var _ = require('../');
}

var eq = _.test.eq;
var ok = _.test.ok;

var test_hash_key_performance = false;

suite('common');

test("test", function(){

    function throws(f){
        var caught = false;
        try{ f(); }catch(e){ caught = true; }
        if(!caught){ throw(_.error("expected_throw", "eq didn't work.")); }
    }

    function no_throws(f){
        var caught = false;
        try{ f(); }catch(e){ _.p(e); caught = true; }
        if(caught){ throw(_.error("unexpected_throw", "eq didn't work.")); }
    }


    throws(function(){ _.test.eq("", {}); });
    throws(function(){ _.test.eq("asdf", {}); });
    throws(function(){ _.test.eq("", null); });
    throws(function(){ _.test.eq({ "a" : [12, { b: 1}] }, { "a" : [12, { b: 2 }] }); });
    no_throws(function(){ _.test.eq("", ""); });
    no_throws(function(){ _.test.eq("a", "a"); });
    no_throws(function(){ _.test.eq({ "a" : [12, { b: 2}] }, { "a" : [12, { b: 2 }] }); });

    throws(function(){ ok(false); });
    no_throws(function(){ ok(true); });

    // test throws
    no_throws(function(){
        _.test.throws(function(){ throw(_.error("code")); });
    });

    no_throws(function(){
        _.test.throws(function(){ throw(_.error("code")); }, "code");
    });

    no_throws(function(){
        _.test.throws(function(){ throw(_.error("code")); }, function(){ return(true); });
    });

    throws(function(){
        _.test.throws(function(){ throw(_.error("code")); }, "other_code");
    });

    throws(function(){
        _.test.throws(function(){ throw(_.error("code")); }, function(){ return(false) });
    });
});

test("comparators", function(){

    function test(f, lt_expects, eq_expects, gt_expects){
        eq(f(0)(1), lt_expects);
        eq(f("a")("b"), lt_expects);

        eq(f(1)(1), eq_expects);
        eq(f("a")("a"), eq_expects);
        eq(f("a")("a"), eq_expects);
        eq(f({ blah: true }, { blah: true }), eq_expects);
        eq(f([1,2], [1,2]), eq_expects);
 
        eq(f(1)(0), gt_expects);
        eq(f("b")("a"), gt_expects);
    }

    test(_.lt, true, false, false);
    test(_.lte, true, true, false);
    test(_.eq, false, true, false);
    test(_.ne, true, false, true);
    test(_.gt, false, false, true);
    test(_.gte, false, true, true);

});

test("deep_equal", function(){
    eq(false, _.deep_equal({ blah: true }, { blah: false }));
    eq(false, _.deep_equal({ blah: "" }, { blah: false }));
    eq(true, _.deep_equal({ blah: true }, { blah: true }));
    eq(true, _.deep_equal(1, 1));
    eq(false, _.deep_equal(1, 0));
});

test("getters / setters", function(){

    function run_tests(o){
        eq(o.get(), "get");
        o.get("blah");
        eq(o.get(), "get");

        eq(o.get_set(), "get_set");
        o.get_set("new_val");
        eq(o.get_set(), "new_val");

        eq(o.get_key(), [0,1,2]);
        eq(o.get_key(0), 0);
        o.get_key(0, 1);
        eq(o.get_key(0), 0);
        eq(o.get_key(), [0,1,2]);

        eq(o.get_set_key(), [0,1,2]);
        eq(o.get_set_key(0), 0);
        o.get_set_key(0, 1);
        eq(o.get_set_key(0), 1);
        eq(o.get_set_key(), [1,1,2]);
        o.get_set_key([2, 3, 4]);
        eq(o.get_set_key(), [2,3,4]);

        eq(o.get_set_key_locked(), [0,1,2]);
        eq(o.get_set_key_locked(0), 0);
        o.get_set_key_locked(0, 1);
        eq(o.get_set_key_locked(0), 1);
        eq(o.get_set_key_locked(), [1,1,2]);
        o.get_set_key_locked([2, 3, 4]);
        eq(o.get_set_key_locked(), [1,1,2]);
    }

    function setup_functions(o){
        o.get = _.getter("_get");
        o.get_set = _.getter_setter("_get_set");
        o.get_key = _.getter_key("_get_key");
        o.get_set_key = _.getter_setter_key("_get_set_key");
        o.get_set_key_locked = _.getter_setter_key("_get_set_key_locked", true);
    };

    function setup_object(o){
        o._get = "get";
        o._get_set = "get_set";
        o._get_key = [0,1,2];
        o._get_set_key = [0,1,2];
        o._get_set_key_locked = [0,1,2];
    }

    function test_prototype(){ setup_object(this); };
    setup_functions(test_prototype.prototype);

    var test_object = {};
    setup_object(test_object);
    setup_functions(test_object);

    var test_prototype_object = new test_prototype();

    run_tests(test_object);
    run_tests(test_prototype_object);

});

test("s", function(){
    eq("", _.s());
    eq("null", _.s(null));
    eq("abc", _.s("abc"));
    eq("2", _.s(2));
    eq("{ o: { a: [] }, a: [ {}, {} ] }", _.s({ o: { a: [] }, a: [{}, {}] }));
});

test("_.str.pop", function(){
    var f = _.str.pop;
    eq(f(), null);
    eq(f("abcd"), "abc"); 
    eq(f("abcd", 2), "ab"); 
    eq(f("abcd", -2), "abcd"); 
    eq(f("abcd", 10), ""); 
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

test("moment", function(){ ok(_.moment().format("YYYY-MM-DD")); });

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

});

test("round", function(){

    eq(10.0, _.round(10.4));
    eq(11.0, _.round(10.5));
    eq(10.0, _.round(11.5, -1));
    eq(20.0, _.round(15, -1));
    eq(0.0, _.round(15, -2));
    eq(10.5, _.round(10.46, 1));
    eq(10.46, _.round(10.46, 2));
    eq(10.46, _.round(10.456, 2));
    eq(10.455, _.round(10.4545, 3));

});

test("decimal_count", function(){
    var f = _.decimal_count;

    eq(f('not a number'), null);
    eq(f(null), null);
    eq(f(), null);
    eq(f(0), 0);
    eq(f('0'), 0);
    eq(f(0.0), 0);
    eq(f('0.0'), 0);
    eq(f('0.1'), 1);
    eq(f(-2), 0);
    eq(f('-2'), 0);
    eq(f('-0.0'), 0);
    eq(f('-0.1'), 1);
    eq(f(2.3446), 4);
    eq(f('2.3446'), 4);
    eq(f(-2.3446), 4);
    eq(f('-2.3446'), 4);
    eq(f('-2.00001'), 5);
    eq(f(-2.00001), 5);
});

test("decimals", function(){
    var f = _.decimals;

    eq(f('not a number'), null);
    eq(f(null), null);
    eq(f(), null);
    eq(f(0), '0');
    eq(f('0'), '0');
    eq(f(0.0), '0');
    eq(f('0.0'), '0');
    eq(f('0.1'), '0');
    eq(f(-2), '-2');
    eq(f('-2'), '-2');
    eq(f('-0.0'), '0');
    eq(f('-0.1'), '-0');
    eq(f(2.3446, 2), '2.34');
    eq(f('2.3456', 2), '2.35');
    eq(f(-2.3446, 2, false), "-2.34");
    eq(f('-2.3446'), '-2');
    eq(f('-2.00001', 2), '-2.00');
    eq(f('-2.00001', 2, false), '-2');
    eq(f(-2.00001, 4), '-2.0000');
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
        eq(f(('0.1'), 1), 0.1);
        eq(f(('  0.1 '), 1), 0.1);
        eq(f('0000'), 0);
        eq(f('2.345'), 2.345);
        eq(f('2.345', NaN), 2);
        eq(f('2.345', 2), 2.35);
        eq(f('2.344', 2), 2.34);
        eq(f('2', 2), 2);
        eq(f(2, 2), 2);
        eq(f(''), null);
        eq(f(null), null);
        eq(f(undefined), null);
        eq(f(), null);
        eq(f("1b2c3"), null);
        eq(f("a1b2c3"), null);
        eq(f("1b2c3", true), 123);
        eq(f("a1b2c3", true), 123);
        eq(f("230px", true), 230);
        eq(f("asdf", true), null);
        eq(f("", true), null);
        eq(f(null, true), null);
        eq(f(0, true), 0);
    }

    to_number_f_test(_.toNumber);
    to_number_f_test(_.to_number);
    to_number_f_test(_.n);
});

test("numbers", function(){

    // using an object is undefined behavior
    eq(_.numbers({ "a": "a", "b": "b", "c": "c" }), [])

    eq(_.numbers(""), "")
    eq(_.numbers(123), "123")
    eq(_.numbers(0), "0")
    eq(_.numbers(), "")
    eq(_.numbers([]), [])
    eq(_.numbers(["a", "b", "c"]), [])
    eq(_.numbers("no numbers"), "")
    eq(_.numbers("a1b2c3d4 f5 +6,789--10"), "12345678910")
    eq(_.numbers(["a", "1", "b", "2","c", 3, "d4", "f5 +6,789--10"]), ["1", "2", 3]);

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
        eq(_.code(err), "timeout");
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
        eq(_.code(err), "timeout");
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
    eq(_.get({ 'a': function(){ return('fb'); }}, 'a', true), 'fb');
    ok(_.isFunction(_.get({ 'a': function(){ return('fb'); }}, 'a')));
});

test('val', function(){
    eq(_.val({ 'A': 'b'}, 'a'), 'b');
    eq(_.val(['a', 'b'], 1), 'b');
    eq(_.val({ 'A': 'b'}, 'c'), undefined);
    eq(_.val({ 'a': 'b'}, 'a'), 'b');
    eq(_.val({ 'a': function(){ return('fb'); }}, 'a'), 'fb');
    eq(_.val({ 'A': function(){ return('fb'); }}, 'a'), 'fb');
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

    var timer = _.time();

    process.maxTickDepth = 1000 * 1000;
    _.p(process.maxTickDepth);
    var a = _.range(1000 * 10000);

    _.each.async(a, function(val, i, next){
        next();
    }, function(){
        timer("each.async");
    });

    done();
});
*/

test('each.async empty', function(done){
    _.each.async([], function(){ }, function(){ 
        done();
    });
});

test("exception", function(){

    var just_code = _.exception("just_code");

    eq(just_code.type, "exception");
    eq(just_code.code, "just_code");
    eq(just_code.message, undefined);

    var e = _.exception("a_code", "a_message");

    eq(e.type, "exception");
    eq(e.code, "a_code");
    eq(e.message, "a_message");

});

test("error", function(){

    var just_code = _.error("just_code");

    eq(just_code.type, "error");
    eq(just_code.code, "just_code");
    eq(just_code.message, undefined);

    var e = _.error("a_code", "a_message");

    eq(e.type, "error");
    eq(e.code, "a_code");
    eq(e.message, "a_message");

    eq(true, _.code(e, e));
    eq(true, _.code("a_code", e));
    eq(true, _.code(e, "a_code"));
    eq(false, _.code(e, "BCode"));
    eq(false, _.code("b_code", e));


    var foo = _.error("foo_code", "foo_message", { message: "bar_message", code: "bar_code", bar_extra: "bar_extra" });

    eq(foo.code, "foo_code");
    eq(foo.message, "foo_message");
    eq(foo.original_message, "bar_message");
    eq(foo.original_code, "bar_code");
    eq(foo.bar_extra, "bar_extra");

    var zoo = _.error("zoo_code", { message: "zoo_message", code: "new_zoo_code", zoo_extra: "zoo_extra" }, { message: "bar_message", code: "bar_code", bar_extra: "bar_extra" });

    eq(zoo.code, "zoo_code");
    eq(zoo.message, "zoo_message");
    eq(zoo.originalMessage, "bar_message");
    eq(zoo.originalCode, "bar_code");
    eq(zoo.zoo_extra, "zoo_extra");
    eq(zoo.bar_extra, "bar_extra");
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

    function throws(callback){ callback(_.error("bad_error", "bad error.")); }

    function abc(callback){ callback(null, 'a', 'b', 'c'); }

    function invalidCall(){ throw(_.exception("bad_call", "Unexpected call.")); }

    function returnsFalse(){ return(false); }
    function returnsTrue(){ return(true); };

    var expectsError = function(err){ eq(true, _.code("bad_error", err)); eq(arguments.length, 1); calls++; }
    var expectsGood = function(err, a, b, c){ ok(!err); eq(a, 'a'); eq(b, 'b'); eq(c, 'c'); calls++; }

    throws(_.plumb(invalidCall, expectsError));
    abc(_.plumb(function(a, b, c){ eq(a, 'a'); eq(b, 'b'); eq(c, 'c'); calls++; }, invalidCall));

    throws(_.plumb(invalidCall, expectsError, "other_error"));
    throws(_.plumb(invalidCall, expectsError, ["other_error"]));
    throws(_.plumb(invalidCall, expectsError, returnsFalse));
    throws(_.plumb(invalidCall, expectsError, [returnsFalse]));

    abc(_.plumb(expectsGood, invalidCall, "other_error"));
    abc(_.plumb(expectsGood, invalidCall, ["other_error", "nother_error"]));
    abc(_.plumb(expectsGood, invalidCall, returnsFalse));
    abc(_.plumb(expectsGood, invalidCall, [returnsFalse]));
    abc(_.plumb(expectsGood, invalidCall, ["other_error", returnsFalse]));

    throws(_.plumb(expectsError, invalidCall, "bad_error"));
    throws(_.plumb(expectsError, invalidCall, ["other_error", "bad_error"]));
    throws(_.plumb(expectsError, invalidCall, returnsTrue));
    throws(_.plumb(expectsError, invalidCall, [returnsFalse, returnsTrue]));

    eq(calls, expectedCalls);
});

test("property_eq", function(){

    var foo = { "foo": "foo" };
    var bar = { "foo": "bar" };

    function test(f){
        var tester = f("foo", "bar");
        ok(!tester(foo));
        ok(tester(bar));
        var curried_tester = f("foo");
        ok(!curried_tester("bar", foo));
        ok(curried_tester("bar", bar));
    }

    test(_.propEq);
    test(_.prop_eq);
    test(_.propertyEq);
    test(_.property_eq);

});

test("property_ne", function(){

    var foo = { "foo": "foo" };
    var bar = { "foo": "bar" };

    function test(f){
        var tester = f("foo", "bar");
        ok(tester(foo));
        ok(!tester(bar));
        var curried_tester = f("foo");
        ok(curried_tester("bar", foo));
        ok(!curried_tester("bar", bar));
    }

    test(_.propNe);
    test(_.prop_ne);
    test(_.propertyNe);
    test(_.property_ne);
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

    comp = _.propertyComparer("z");

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
    eq(_.code({type:'error', code:"foo"}, "bar", "foo"), true);
    eq(_.code({type:'exception', code:"foo"}), "foo");
    eq(_.code({type:'error', code:"foo"}, "foo"), true);
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

    _.f(100, function(){ actual++; });

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

test("byte_units", function(){ 
    eq(_.byte_units(1020), "1020B");
    eq(_.byte_units(1020, 2), "1020B");
    eq(_.byte_units(1128), "1.1K");
    eq(_.byte_units(1128, 2), "1.10K");
    eq(_.byte_units(1124 * 1024), "1.1M");
    eq(_.byte_units(1024 * 1024 * 1024), "1G");

    eq(_.byte_units(-1020), "-1020B");
    eq(_.byte_units(-1020, 2), "-1020B");
    eq(_.byte_units(-1128), "-1.1K");
    eq(_.byte_units(-1128, 2), "-1.10K");
    eq(_.byte_units(-1124 * 1024), "-1.1M");
    eq(_.byte_units(-1024 * 1024 * 1024), "-1G");
});

test("hash_key_performance", function(){
    if(!test_hash_key_performance){ return; }

    var iterations = 10 * 1000;

    function test_hash(key){
        var h = {};
        var timer = _.time();
        for(var i = 0; i < iterations; i++){
            h[key] = i + (i-1);
        }
        timer("key length: " + _.byte_units(key.length));
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
    eq(_.basic_type(false), 'boolean');
    eq(_.basic_type(true), 'boolean');
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


test("lodash", function(){

    var sum = _.curry(function(a, b, c){
        return(a + b + c);
    });

    eq(sum(1)(2)(3), 6);
    eq(sum(1, 2)(3), 6);
    eq(sum(1, 2, 3), 6);
    eq(sum(1, 2, 3, 4), 6);
    
});

