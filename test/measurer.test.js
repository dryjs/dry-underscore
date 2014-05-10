var assert = require('assert');
var _ = require('../');
var eq = _.test.eq;
var ok = _.test.ok;

function Measurer(){};
_.measurer(Measurer.prototype);

exports.testDefault = function(beforeExit){

   function test(measurer){
        var calls = 0;
        var expectedCalls = 2;
        
        measurer.measure("timeout", "one");

        setTimeout(function(){ 
            ok(_.within(measurer.measure("timeout", "one").duration, 100, 5));
            calls++;
        }, 100);
        
        measurer.measure("timeout", "two");
        setTimeout(function(){ 
            ok(_.within(measurer.measure("timeout", "two").duration, 100, 5));
            calls++;
        }, 100);
        
        setTimeout(function(){
            _.log(measurer.measure().get());
            measurer.measure().display(measurer.measure("timeout").last(), _.log);
        }, 200);

        beforeExit(function(){ eq(calls, expectedCalls) });
    }
    
    test(_);
    test(_.measurer({}));
    test(new Measurer());
};

