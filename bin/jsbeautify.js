#!/usr/local/bin/node

var path = require('path');
var fs = require('fs');

var filePath = process.argv[2];

if(!filePath){
    console.log('usage: jsbeautify [filename]');
    return;
}

filePath = path.normalize(filePath);

_.code.beautify(filePath, function(){});

