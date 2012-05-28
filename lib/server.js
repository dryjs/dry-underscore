
var fs = require('fs');
var url = require('url');
var child_process = require('child_process');

exports.mixin = function(_){
    _.mixin({
        readTextFile : function(path, callback){
            fs.readFile(path, 'utf8', function(err, text){
                if(err){ callback(null); }
                else{ callback(text); }
            });
        },
        readJsonFile : function(path, callback){
            _.readTextFile(path, function(text){
                if(text){ 
                    try{ callback(JSON.parse(text)); }
                    catch(e){ console.error(e); callback(null); }
                }else{ callback(null); }
            });

        },
        wget : function(url, destPath, callback){
            var wget = 'wget -O ' + destPath + ' ' + url;
            // excute wget using child_process' exec function

            child_process.exec(wget, function(err, stdout, stderr) {
                if (err){ callback(err); }
                else{ callback(null); }
            });
        }
    });
};

