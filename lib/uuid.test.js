"use strict";

var _ = require('../');

var eq = _.test.eq;
var ok = _.test.ok;

suite('uuid');

test("generate", function(){
    eq(_.uuid().length, 36);
});
