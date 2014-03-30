
var path = require('path');
var assert = require('assert');

var _ = require('../');
var eq = _.test.eq;

//exports.testSecure = testSecure;
exports.testStyle = testStyle;
exports.testStrip = testStrip;

//function testSecure(){ };

function testStyle(){

    var input = '<html><head></head><body><div class="classOne classTwo" style="border: 1px solid black;"><a href="hello" style="color: blue;">anchor</a></div><div></div></body></html>';
    var expected = '<html><head></head><body><div class="classOne classTwo" style="border: 1px solid black; color: green;"><a href="hello" style="color: blue; color: black;">anchor</a></div><div style="color: green;"></div></body></html>';

    var result = _.html.style(input, {div: "color: green;", a: "color: black;"});

    eq(result, expected);

};

function testStrip(){

    var input = '<html><head></head><body>this is <div class="classOne classTwo" style="border: 1px solid black;">some <a href="hello" style="color: blue;">anchor</a>.</div><div></div></body></html>';
    var expected = 'this is some anchor.';

    var result = _.html.strip(input);

    eq(result, expected);
};


