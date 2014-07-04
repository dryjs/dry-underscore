"use strict";

exports.mixin = function(_){

var plumber = function(f){

    if(f === undefined){ f = {}; }
    
    f.plunger = function(err){ throw(err); };

    f.plumb = function(goodF, badF, catchList){

        if(!badF){ badF = this.plunger; }

        if(catchList && !_.isArray(catchList)){
            catchList = [catchList];
        }

        function shouldCatch(err){
            return(_.find(catchList, function(filter){
                if(_.isFunction(filter)){
                    return(filter(err));
                }else if(_.isString(filter)){
                    return(_.error.eq(filter, err));
                }else{ return(false); }
            }));
        }

        return(function(err){
            var args = _.a(arguments);
            var argsSliced = args.slice(1);

            if(!err){ 
                if(catchList){ return goodF.apply(null, args); }
                else{ return goodF.apply(null, argsSliced); }
            }

            if(catchList && shouldCatch(err)){
                return goodF.apply(null, args);
            }else{
                return badF.apply(null, args);
            }
        });
    };

    return(f);
};

return(plumber);

};

