"use strict";

var _ = require('./');
var eq = _.test.eq;
var ok = _.test.ok;


exports.testMakeClassPerformance = testMakeClassPerformance;
exports.testForPerformance = testForPerformance;
exports.testLogPerformance = testLogPerformance;

function testLogPerformance(){

    // var n = 1; 
    var n = .1 * 1000 * 1000;

    var timer = _.time("make log");
    _.for(n, function(){ 
        _.log.make();
    });
    timer();
}

function testForPerformance(){

    var n = 10 * 1000 * 1000;
    var strN = "10M";

    var timer = _.time("for loop " + strN);
    for(var i = 0; i < n; i++){
        _.noop();
    }
    timer();
    timer = _.time("for loop " + strN);
    for(i = 0; i < n; i++){
        _.noop();
    }
    timer();

    timer = _.time("for function " + strN);
    _.for(n, function(){ });
    timer();
    timer = _.time("for function " + strN);
    _.for(n, function(){ });
    timer();
}

function testMakeClassPerformance(){

    var n = 1 * 1000 * 1000;

    function c(x, y){
        this.x = x;
        this.y = y;
    }
    c.prototype.str = function(){ return("str"); };

    function cwrap(x, y){ return(new c(x, y)); }

    var makeC = _.makeClass(); 
    
    makeC.prototype.init = function(x, y){
        this.x = x;
        this.y = y;
    }
    makeC.prototype.str = function(){ return("str"); };

    // var makeCF = function(){ if(this.init){ this.init.apply(this, arguments); } };
    var makeCF = _.fastMakeClass();
    
    makeCF.prototype.init = function(x, y){
        this.x = x;
        this.y = y;
    }
    makeCF.prototype.str = function(){ return("str"); };

    // we call the same loop twice to "compile" it I guess
    // I know the timing is high the first time and constant
    // the other times

    var timer = _.time("native");
    _.for(n, function(){ 
        var ci = new c(1, 2);
        ci.y = ci.x + ci.y;
    });
    timer();
    timer = _.time("native");
    _.for(n, function(){ 
        var ci = new c(1, 2);
        ci.y = ci.x + ci.y;
    });
    timer();

    timer = _.time("nativeWrap");
    _.for(n, function(){ var ci = cwrap(1, 2); });
    timer();
    timer = _.time("nativeWrap");
    _.for(n, function(){ var ci = cwrap(1, 2); });
    timer();

    timer = _.time("makeClassFast");
    _.for(n, function(){ var ci = new makeCF(1, 2); });
    timer();
    timer = _.time("makeClassFast");
    _.for(n, function(){ var ci = new makeCF(1, 2); });
    timer();

    timer = _.time("makeClass");
    _.for(n, function(){ var ci = new makeC(1, 2); });
    timer();
    timer = _.time("makeClass");
    _.for(n, function(){ var ci = new makeC(1, 2); });
    timer();
}


