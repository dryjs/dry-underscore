
var fs = require('fs');

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
        
        }
    });
};

