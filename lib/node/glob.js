"use strict";

var minimatch = require('minimatch');

function mixin(_){

var glob = {};

glob.matchFile = glob.match_file = function(path, glob, options){
    if(_.isBoolean(options)){ options = { dot : options }; }
    return(minimatch(path, glob, _.extend({ matchBase: true, nonegate: true}, options)));
};

glob.matchPath = glob.match_path = function(path, glob, options){
    if(_.isBoolean(options)){ options = { dot : options }; }
    return(minimatch(path, glob, _.extend({nonegate: true}, options)));
};

return(glob);

}

exports.mixin = mixin;
