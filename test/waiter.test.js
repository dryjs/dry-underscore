
var _ = require('../');

var eq = _.test.eq;
var ok = _.test.ok;

exports.testSimple = testSimple;
exports.testCallback = testCallback;
exports.testResults = testResults;
exports.testPlumb = testPlumb;
exports.testPlumbAll = testPlumbAll;
exports.testOutOfOrder = testOutOfOrder;
exports.testExtraArgs = testExtraArgs;

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

function testResults(beforeExit){

    var called = 0;

    function asyncFunction(i, callback){ 
        _.nextTick(function(){ callback(i, "a", "b"); });
    }

    var w = _.waiter();

    _.for(10, function(i){ asyncFunction(i, w.defer()); });

    var expected = [];
    _.for(10, function(i){ expected.push([i, "a", "b"]); });

    var results = [];

    w.results(function(i, a, b){ 
        results.push([i, a, b]);
    }, function(){
        called++;
        eq(results, expected);
    });

    beforeExit(function(){ eq(called, 1); });
}

function testExtraArgs(beforeExit){

    var called = 0;

    function asyncFunction(i, callback){ 
        _.nextTick(function(){ callback(i, "a", "b"); });
    }

    var w = _.waiter();

    _.for(10, function(i){ asyncFunction(i, w.defer("z", "x")); });

    var expected = [];
    _.for(10, function(i){ expected.push([i, "a", "b", "z", "x"]); });

    var results = [];

    w.results(function(i, a, b, c, d){ 
        results.push([i, a, b, c, d]);
    }, function(){
        called++;
        eq(results, expected);
    });

    beforeExit(function(){ eq(called, 1); });
}



function testPlumbAll(beforeExit){

    var badCalled = 0;

    function asyncFunction(i, callback){ 
        _.nextTick(function(){ callback(i, "a", "b"); });
    }

    var w = _.waiter();

    _.for(10, function(i){ asyncFunction(i+1, w.defer()); });

    w.plumbAll(_.noop, function(errs){
        eq(errs, _.range(1, 11));
        badCalled++;
    });

    var goodCalled = 0;

    var z = _.waiter();

    z.defer()(null, 0);
    z.defer()(null, 1);
    z.defer()(null, 2);

    z.plumbAll(function(){ goodCalled++; }, _.noop);

    beforeExit(function(){ 
        eq(badCalled, 1);
        eq(goodCalled, 1);
    });
}

function testPlumb(beforeExit){

    var badCalled = 0;

    function asyncFunction(i, callback){ 
        _.nextTick(function(){ callback(i, "a", "b"); });
    }

    var w = _.waiter();

    _.for(10, function(i){ asyncFunction(i+1, w.defer()); });


    w.plumb(_.noop, function(err){
        eq(err, 1);
        badCalled++;
    });

    var goodCalled = 0;

    var z = _.waiter();

    z.defer()(null, 1);

    z.plumb(function(){ goodCalled++; }, _.noop);

    beforeExit(function(){ 
        eq(badCalled, 1);
        eq(goodCalled, 1);
    });
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

function testCallback(beforeExit){

    var called = 0;

    function asyncFunction(i, callback){ 
        _.nextTick(function(){ callback(i, "a", "b"); });
    }

    var w = _.waiter();

    _.for(10, function(i){ asyncFunction(i, w.callback()); });

    var expected = [];
    _.for(10, function(i){ expected.push([i, "a", "b"]); });

    w.wait(function(results){ 
        results = _.map(results, _.toArray);
        eq(results, expected);
        called++;
    });

    beforeExit(function(){ eq(called, 1); });
}
