
require('tamejs').register();

var fs = require('fs');
var url = require('url');
var child_process = require('child_process');
var mustache = require('mustache');

exports.mixin = function(_){

    _.fs = require('./fs.tjs').fs(_);

    _.mixin({
        readTextFile : function(path, callback){
            fs.readFile(path, 'utf8', function(err, text){
                if(err){ callback(null); }
                else{ callback(text); }
            });
        },
        writeFile : function(path, text, callback){
            fs.writeFile(path, text, function(err){
                callback(err);
            });
        },
        readJsonFile : function(path, callback){
            _.readTextFile(path, function(text){
                if(text){ 
                    try{ callback(JSON.parse(text)); }
                    catch(e){ console.error(e); console.dir(e); callback(null); }
                }else{ callback(null); }
            });

        },
        renderFile : function(path, hash, callback){
            _.readTextFile(path, function(text){
                if(text != null){ callback(_.render(text, hash)); }
                else{ callback(null); }
            });
        },
        render : function(template, hash){
            return(mustache.render(template, hash))
        },
        wget : function(url, destPath, callback){
            var wget = 'wget -O ' + destPath + ' ' + url;
            // excute wget using child_process' exec function

            child_process.exec(wget, function(err, stdout, stderr) {
                if (err){ callback(err); }
                else{ callback(null); }
            });
        },
        request : require('../deps/superagent')
    });
};

