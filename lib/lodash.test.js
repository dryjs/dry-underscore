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

