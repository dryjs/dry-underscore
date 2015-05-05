var assert = require('assert');
var _ = require('../');
var eq = _.test.eq;
var ok = _.test.ok;

function Measurer(){};
_.measurer.make(Measurer.prototype);

exports.testDefault = function(beforeExit){

   function test(measurer){
        var calls = 0;
        var expectedCalls = 4;
        
        measurer.measure("timeout", "one");
        setTimeout(function(){ 
            ok(_.within(measurer.measure("timeout", "one").duration, 80, 10));
            calls++;
        }, 80);
        
        measurer.measure("timeout", "two");
        setTimeout(function(){ 
            ok(_.within(measurer.measure("timeout", "two").duration, 100, 10));
            calls++;
        }, 100);

        var token = measurer.measure("token", "one")
        setTimeout(function(){ 
            ok(_.within(measurer.measure(token).duration, 120, 10));
            calls++;
        }, 120);

        var tokenTwo = measurer.measure();
        setTimeout(function(){ 
            ok(_.within(measurer.measure(tokenTwo).duration, 200, 10));
            calls++;
        }, 200);
        

        /*
        setTimeout(function(){
            // _.stderr(measurer.measurements());
            // measurer.displayLast("timeout", _.stderr);
        }, 200);
        */

        beforeExit(function(){ eq(calls, expectedCalls) });
    }
    
    test(_.measurer);
    test(_.measurer.make({}));
    test((new Measurer()).measurer);
};

