"use strict";

var _ = require('../');

var eq = _.test.eq;
var ok = _.test.ok;

suite('diff');

test("string", function(){
    eq(_.diff.human(_.diff("foo", "bar")), ['lhs: "foo"\nrhs: "bar"']);

    eq(_.diff.human(_.diff({ a: "foo" }, { a: "bar"})), ['lhs.a: "foo"\nrhs.a: "bar"']);
    eq(_.diff.human(_.diff({ a: "foo" }, { a: "bar"}), "a", "b", " ne "), ['a.a: "foo" ne b.a: "bar"']);
    eq(_.diff.human(_.diff({ a: { b: "foo" } }, { a: { b: "bar"} }), "a", "b", " ne "), ['a.a.b: "foo" ne b.a.b: "bar"']);
    eq(_.diff.human(_.diff({ a: { b: null } }, { a: { b: undefined} }), "a", "b", " ne "), ['a.a.b: null ne b.a.b: undefined']);
    eq(_.diff.human(_.diff({ a: { b: null } }, { a: {} }), "a", "b", " ne "), ['a.a.b: null ne b.a.b: undefined']);
    eq(_.diff.human(_.diff("blah", 1)), ['lhs: "blah"\nrhs: 1']);
    eq(_.diff.human(_.diff("1", 1)), ['lhs: "1"\nrhs: 1']);
});

