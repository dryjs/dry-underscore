
var path = require('path');
var assert = require('assert');

var _ = require('../');

exports.testNs = testNs;

var se = assert.strictEqual;
var de = assert.deepEqual;

function testNs(){

    function test(tree){

        se(tree.child("single", null), null);
        se(tree.child("single"), null);
        se(tree.child("jimmy"), undefined);
        se(tree.child("jimmy", "jimmy"), "jimmy");
        se(tree.jimmy, "jimmy");
        se(tree.child("deep.child.ne"), undefined);
        de(tree.child("deep.child.hello", "hello"), "hello");
        de(tree.child("deep.child.new", {"hello": "hello"}), {"hello" : "hello"});
        se(tree.child("deep.child.null"), undefined);
        de(tree.child("deep.a.obj", {"obj": "obj"}), {"obj" : "obj"});
        de(tree.child("deep.a.new", {"new" : "new"}), {"new": "new"});
        de(tree.child("deep.a.obj"), {"obj": "obj"});
        se(tree.child("deep.a.ne"), undefined);
        de(tree.child("deep.a.nc", {"nc": "nc"}), {"nc" : "nc"});
        de(tree.child("deep.a.z",{"z": "z"}), {"z" : "z"});

        de(tree.child("deep.a"), {
            "obj" : {"obj" : "obj"},
            "new" : {"new" : "new"},
            "nc" : {"nc" : "nc"},
            "z" : {"z" : "z"}
        });

        de(tree.single, null);

        de(tree.deep.a, {
            "obj" : {"obj" : "obj"},
            "new" : {"new" : "new"},
            "nc" : {"nc" : "nc"},
            "z" : {"z" : "z"}
        });
    }

    test(_.ns());
    test(_.ns({}));

    function f(){};
    _.ns(f.prototype);
    test(new f());
}
