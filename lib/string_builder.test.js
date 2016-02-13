"use strict";

var _ = require('../');

var eq = _.test.eq;
var ok = _.test.ok;

suite('string_builder');

test("simple", function(){

    var sb = _.string_builder();

    sb.add(2, "double"); sb.add("\n");
    sb.add_line("in_zero");
    sb.in(2);
    sb.add_line("in_two", {a: true}, [1,2]);
    sb.in(2);
    sb.add_line("in_four", "five", "six");
    sb.out(2);
    sb.add_line("in_two", [1,2,3]);
    sb.out(2);
    sb.add_line("in_zero");

    var expects = "";

    expects += "doubledouble\n";
    expects += "in_zero\n";
    expects += "  in_two { a: true } [ 1, 2 ]\n";
    expects += "    in_fourfivesix\n";
    expects += "  in_two [ 1, 2, 3 ]\n";
    expects += "in_zero\n";

    eq(sb.string(), expects);

});

