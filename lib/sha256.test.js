"use strict";

var _ = require('dry-underscore');

var eq = _.test.eq;
var ok = _.test.ok;

suite('sha256');

test("hash", function(){
     
    var tests = [
        { val: "abc", hash: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad" },
        { val: "this is a test", hash: "2e99758548972a8e8822ad47fa1017ff72f06f3ff6a016851f45c398732bc50c" },
        { val: "", hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
    ];

    _.each(tests, function(test){
        eq(_.sha256(test.val), test.hash);
    });

});
