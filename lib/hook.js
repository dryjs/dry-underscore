"use strict";

exports.mixin = function(_){

// TODO: rewrite error handling, pass errors along chain
// TODO: add timeout to hooker
var hooker = function(f){

    if(f === undefined){ f = {}; }
        
    f.hook = function(event, callback){
        var that = this;
        if(!event || !callback){ _.fatal("You must provide an event name and a function."); }
        event = event.toLowerCase();
        if(that._hooks === undefined){ that._hooks = {}; }
        if(that._hooks[event] === undefined){ that._hooks[event] = []; }

        that._hooks[event].push({handler: callback});
    };

    f.unhook = function(event, callback){
        var that = this;
        
        if(!that._hooks){ return; }
        
        if(!event || !callback){ _.fatal("You must provide an event name and a function."); }
        event = event.toLowerCase();

        if(that._hooks && that._hooks[event]){
            that._hooks[event] = _.filter(that._hooks[event], function(val){
                if(_.isFunction(callback)){
                    return(val.handler !== callback);                    
                }
            });
        }
    };

    f.bite = f.serial = function(event, args, callback){
        var that = this;

        if(_.isFunction(args) && !callback){
            callback = args;
            args = [];
        }

        if(!_.isString(event) || !_.isFunction(callback)){
            _.fatal("You must provide an event name and a function.");
        }
        event = event.toLowerCase();
        
        var error = null;
        if(that._hooks && that._hooks[event]){
            _.each.async(that._hooks[event], function(val, key, next, end){
                // var to = _.timeout("Hook for event: " + event + " doesn't return in a timely manner, it probably forgot to call next.", 5000);
                val.handler.apply(null, _.concat(function(err){
                    if(err){ error = err; end(); }
                    else{ next(); }
                }, args));
            }, function(){
                callback.apply(null, _.concat(error, args));
            });
        }else{
            callback.apply(null, _.concat(null, args));
        }
    };
    
    /*
    f.biteAll = f.parallel = function(event, args, callback){ };
    */
    
    return(f);
};

return(hooker);

};

