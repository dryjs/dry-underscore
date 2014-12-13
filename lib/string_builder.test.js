"use strict";

var _ = require('dry-underscore');

var eq = _.test.eq;
var ok = _.test.ok;

suite('string_builder');

test("simple", function(){

    var sb = _.string_builder();

    sb.add(2, "double"); sb.add("\n");
    sb.add_line("in_zero");
    sb.in(2);
    sb.add_line("in_two");
    sb.in(2);
    sb.add_line("in_four");
    sb.out(2);
    sb.add_line("in_two");
    sb.out(2);
    sb.add_line("in_zero");

    var expects = "";

    expects += "doubledouble\n";
    expects += "in_zero\n";
    expects += "  in_two\n";
    expects += "    in_four\n";
    expects += "  in_two\n";
    expects += "in_zero\n";

    eq(sb.string(), expects);

});

