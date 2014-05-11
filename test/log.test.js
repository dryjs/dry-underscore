
var assert = require('assert');
var _ = require('../');
var eq = _.test.eq;

exports.testLog = testLog;
exports.testChild = testChild;
exports.testPerformance = testPerformance;

function testPerformance(){

    // var n = 1; 
    var n = .1 * 1000 * 1000;

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
    tt.writeFunction(function(log, logLevel, timestamp, message){ called++; eq(message, this._expected); });

    var log = _.log.make();
    log.transports([tt]);

    tt.expected("foo");

    log.debug("foo");
    log.info("foo");
    log.emerg("foo");

    log.level("info");

    log.debug("----");
    log.info("foo");
    log.emerg("foo");

    log.level("crit");

    log.debug("----");
    log.info("----");
    log.emerg("foo");
 
    log.level("crit");

    log.info("----");
    log.error("----");
    log.crit("foo");
    log.emerg("foo");


    eq(called, 8);
}

function testChild(){

    var parentCalled = 0;
    var childCalled = 0;
   
    var parentTransport = new testTransport();
    parentTransport.writeFunction(function(log, logLevel, timestamp, message){ parentCalled++; eq(message, this._expected); });

    var childTransport = new testTransport();
    childTransport.writeFunction(function(log, logLevel, timestamp, message){ childCalled++; eq(message, this._expected); });

    var parent = _.log.make();
    parent.namespace("parent");
    parent.transports([parentTransport]);

    var log = parent.child();
    log.namespace("child.test");
    log.transports([childTransport]);

    parentTransport.expected("parent.child.test: foo");
    childTransport.expected("parent.child.test: foo");

    log.debug("foo");
    log.info("foo");
    log.emerg("foo");

    log.level("info");

    log.debug("----");
    log.info("foo");
    log.emerg("foo");

    log.level("crit");

    log.debug("----");
    log.info("----");
    log.emerg("foo");
 
    log.level("crit");

    log.info("----");
    log.error("----");
    log.crit("foo");
    log.emerg("foo");

    eq(parentCalled, 8);
    eq(childCalled, 8);
}
