
var assert = require('assert');

var _ = require('../');
var eq = _.test.eq;

exports.testLog = testLog;
exports.testChild = testChild;
exports.testPerformance = testPerformance;

function testPerformance(){

    var n = 1; 
    // var n = 1 * 1000 * 1000;

    _.time("make log");
    _.for(n, function(){ 
        _.log.make();
    });
    _.time("make log", true);
}

function testTransport(){ }
testTransport.prototype.expected = function(str){ this._expected = str; };
testTransport.prototype.writeEntry = function(){ this._writeFunction.apply(this, arguments); };
testTransport.prototype.writeFunction = function(f){ this._writeFunction = f; };

function testLog(){

    var called = 0;

    var tt = new testTransport();
    tt.writeFunction(function(logLevel, timestamp, message){ called++; eq(message, this._expected); });

    var log = _.log.make();
    log.transports = [tt];

    tt.expected("foo");

    log().debug("foo");
    log().info("foo");
    log("foo");

    log.level("info");

    log().debug("----");
    log().info("foo");
    log("foo");

    log.level("crit");

    log().debug("----");
    log().info("----");
    log("foo");
 
    log.level("crit");

    log().info("----");
    log().error("----");
    log().crit("foo");
    log("foo");


    eq(called, 8);
}

function testChild(){

    var called = 0;
   
    var tt = new testTransport();
    tt.writeFunction(function(logLevel, timestamp, message){ called++; eq(message, this._expected); });

    var log = _.log.make();
    log.transports = [tt];

    tt.expected("foo");

    log().debug("foo");
    log().info("foo");
    log("foo");

    log.level("info");

    log().debug("----");
    log().info("foo");
    log("foo");

    log.level("crit");

    log().debug("----");
    log().info("----");
    log("foo");
 
    log.level("crit");

    log().info("----");
    log().error("----");
    log().crit("foo");
    log("foo");


    eq(called, 8);
}
