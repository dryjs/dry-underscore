
exports.mixin = function(_){

var hooker = function(f){

    if(f === undefined){ f = {}; }
        
    f.hook = function(event, callback){
        var that = this;
        if(!event || !callback){ _.fatal("You must provide an event name and a function."); }
        event = event.toLowerCase();
        if(that._events === undefined){ that._events = {}; }
        if(that._events[event] === undefined){ that._events[event] = []; }

        that._events[event].push({handler: callback});
    };

    f.unhook = function(event, callback){
        var that = this;
        
        if(!that._events){ return; }
        
        if(!event || !callback){ _.fatal("You must provide an event name and a function."); }
        event = event.toLowerCase();

        if(that._events && that._events[event]){
            that._events[event] = _.filter(that._events[event], function(val){
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
        
        if(that._events && that._events[event]){
            var to = _.timeout("Hook for event: " + event + " doesn't return in a timely manner, it probably forgot to call next.");
            _.eachAsync(that._events[event], function(val, key, next, end){
                val.handler.apply(null, _.concat(next, args));
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

