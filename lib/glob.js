"use strict";

var minimatch = require('minimatch');

function mixin(_){

var glob = {};


glob.matchFile = function(path, glob, options){
    if(_.isBoolean(options)){ options = { dot : options }; }
    return(minimatch(path, glob, _.extend({ matchBase: true, nonegate: true}, options)));
};

glob.matchPath = function(path, glob, options){
    if(_.isBoolean(options)){ options = { dot : options }; }
    return(minimatch(path, glob, _.extend({nonegate: true}, options)));
};

return(glob);

}

exports.mixin = mixin;
