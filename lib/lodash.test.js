"use strict";

var _ = require('../');

var eq = _.test.eq;
var ok = _.test.ok;

suite('lodash');

test("curry", function(){

    var sum = _.curry(function(a, b, c){
        return(a + b + c);
    });

    eq(sum(1)(2)(3), 6);
    eq(sum(1, 2)(3), 6);
    eq(sum(1, 2, 3), 6);
    eq(sum(1, 2, 3, 4), 6);

});

test("curry out of order", function(){

    var subtract = _.curry(function(a, b){
        return(a - b);
    });

    eq(subtract()(10)(1), 9);
    eq(subtract(10)(1), 9);
    eq(subtract(10, 1), 9);
    eq(subtract(_, 1)(10), 9);

});

test("curry time", function(){

    var sum = function(a, b){ return(a+b); };
    var csum = _.curry(function(a, b){ return(a+b); });

    var nc = _.time("not_curried");
    for(var i = 0; i < 10 * 100 * 1000; i++){ sum(i, i+1); }
    var nc_ms = nc("not_curried");

    var c = _.time("curried");
    for(var i = 0; i < 10 * 100 * 1000; i++){ csum(i, i+1); }
    var c_ms = c("curried");

    _.p("time difference: ", c_ms - nc_ms, " ms");

});

