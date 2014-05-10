"use strict";

exports.mixin = function(_){

var plumber = function(f){

    if(f === undefined){ f = {}; }
    
    f.plunger = function(err){ 
        throw(err);
    };

    f.plumb = function(goodF, badF){
        var self = this;
        var args = arguments;
        return(function(err){
            if(err){ 
                args = _.toArray(args);
                if(_.isFunction(badF)){
                    args = args.slice(2);
                    args.unshift(err);
                    return badF.apply(null, args);
                }else{
                    args = args.slice(1);
                    args.unshift(err);
                    return self.plunger.apply(self, args);
                }
            }else{
                goodF.apply(null, _.toArray(arguments).slice(1));
            }
        });
    };

    return(f);
};

return(plumber);

};

