
var _ = require('../');
var eq = _.test.eq;
var ok = _.test.ok;

exports.testPipeline = testPipeline;

function testPipeline(beforeExit){

    var calls = 0;
    var expectedCalls = 0;

    var p = _.pipeline();

    p.before("2", "1");
    p.after("2", "3");
    p.before("5", "4");
    p.before("4", "3");
    p.after("6", "7");
    p.before("6", "5");
    p.before("1", "0");

    try{ p.order(); }
    catch(e){ ok(false); }

    eq(p.order(), ['0', '1', '2', '3', '4', '5', '6', '7']);

    p.before("9", "8");

    try{ p.order(); }
    catch(e){ _.error.eq(e, "DanglingStep"); }

    p.after("7", "8");

    try{ p.order(); }
    catch(e){ ok(false); }

    eq(p.order(), ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);

    beforeExit(function(){ eq(calls, expectedCalls); });
}
