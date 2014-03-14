
exports.mixin = function(_){

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

    f.bite = function(event){ // ..., callback
        var that = this;
        var args = _.toArray(arguments);

        var event = args.shift();
        var callback = args.pop();

        if(!_.isString(event) || !_.isFunction(callback)){
            _.fatal("You must provide an event name and a function.");
        }
        event = event.toLowerCase();
        
        if(that._hooks && that._hooks[event]){
            var to = _.timeout("Hook for event: " + event + " doesn't return in a timely manner, it probably forgot to call next.");
            _.eachAsync(that._hooks[event], function(val, key, next, end){
                val.handler.apply(null, _.concat(function(keepRunning){
                    if(keepRunning === false){ end(); }
                    else{ next(); }
                }, args));
            }, function(){
                to.back();
                callback();
            });
        }else{
            callback();
        }
    };
    
    return(f);
};

return(hooker);

};

