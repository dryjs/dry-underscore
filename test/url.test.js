"use strict";

var assert = require('assert');
var fs = require('fs');

var _ = require('../');

var eq = _.test.eq;
var ok = _.test.ok;

exports.testJoin = testJoin;
exports.testFun = testFun;
exports.testParse = testParse;

function testJoin(){

    eq(_.url.join('http://www.google.com/', 'foo/bar'),
        'http://www.google.com/foo/bar');

    eq(_.url.join('http://www.google.com/', 'foo/bar', '?test=123'),
        'http://www.google.com/foo/bar?test=123');

    eq(_.url.join('http:', 'www.google.com/', 'foo/bar', '?test=123'),
      'http://www.google.com/foo/bar?test=123');

    eq(_.url.join('http:', 'www.google.com///', 'foo/bar', '?test=123'),
      'http://www.google.com/foo/bar?test=123');

    eq(_.url.join('http:', 'www.google.com///', 'foo/bar', '?test=123', '#faaaaa'),
      'http://www.google.com/foo/bar?test=123#faaaaa');
}

function testParse(){

    var parsed = _.url.parse("http://root.com:80/api?test=123");

    eq(parsed.protocol, "http:");
    eq(parsed.host, "root.com:80");
}
   
function testFun(){

    var root = _.url.fun("http://root");

    eq(root(), "http://root");

    var child = _.url.fun(root, "child");

    eq(child(), "http://root/child");

    var caught = 0;
    try{
        var bad = _.url.fun(0);
    }catch(e){
        eq(e.code, "BadRoot");
        caught++;
    }

    eq(caught, 1);
}

