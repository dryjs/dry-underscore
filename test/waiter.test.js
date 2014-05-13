
var _ = require('../');

var eq = _.test.eq;
var ok = _.test.ok;

exports.testSimple = testSimple;
exports.testOutOfOrder = testOutOfOrder;

function testOutOfOrder(beforeExit){

    var called = 0;

    function syncFunction(i, callback){ 
        callback(i, "a", "b");
    }

    var w = _.waiter();

    _.for(10, function(i){ syncFunction(i, w.defer()); });

    var expected = [];
    _.for(10, function(i){ expected.push([i, "a", "b"]); });

    w.wait(function(results){ 
        results = _.map(results, _.toArray);
        eq(results, expected);
        called++;
    });

    beforeExit(function(){ eq(called, 1); });
}

function testSimple(beforeExit){

    var called = 0;

    function asyncFunction(i, callback){ 
        _.nextTick(function(){ callback(i, "a", "b"); });
    }

    var w = _.waiter();

    _.for(10, function(i){ asyncFunction(i, w.defer()); });

    var expected = [];
    _.for(10, function(i){ expected.push([i, "a", "b"]); });

    w.wait(function(results){ 
        results = _.map(results, _.toArray);
        eq(results, expected);
        called++;
    });

    beforeExit(function(){ eq(called, 1); });
}
