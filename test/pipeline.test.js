
var _ = require('../');
var eq = _.test.eq;
var ok = _.test.ok;

exports.testPipeline = testPipeline;
exports.testDryBuild = testDryBuild;

function testPipeline(beforeExit){

    var calls = 0;
    var expectedCalls = 0;

    var p = _.pipeline();

    p.before("2", "1");
    p.after("2", "3");
    p.before("5", "4");
    p.after("6", "7");
    p.before("4", "3");
    p.before("6", "5");
    p.before("1", "0");
    p.before("1", "0.5");

    try{ p.order(); }
    catch(e){ 
        p.printNodes();
        _.p(e.message);
        ok(false);
    }

    eq(p.order(), ['0', '0.5', '1', '2', '3', '4', '5', '6', '7']);

    p.before("9", "8");

    try{ p.order(); }
    catch(e){ ok(_.code(e, "dangling_step")); }

    p.after("7", "8");

    try{ p.order(); }
    catch(e){ ok(false); }

    eq(p.order(), ['0', '0.5', '1', '2', '3', '4', '5', '6', '7', '8', '9']);

    beforeExit(function(){ eq(calls, expectedCalls); });
}

function testDryBuild(beforeExit){

    var calls = 0;
    var expectedCalls = 0;

    var p = _.pipeline();

    p.before("skeletons", "skeletons-expand");
    p.after("skeletons", "models");
    p.before("models", "models-build");
    p.after("models", "bundle");

    eq(p.order(), ['skeletons-expand', 'skeletons', 'models-build', 'models', 'bundle']);

    beforeExit(function(){ eq(calls, expectedCalls); });
}
