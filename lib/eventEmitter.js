
exports.mixin = function(_){

var eventEmitter = function(f){

    if(f === undefined){ f = {}; }
        
    f.on = function(event, tag, callback){
        var that = this;
        if(_.isFunction(tag)){
            callback = tag;
            tag = "";
        }
        if(!event || !callback){
            throw(new Error("You must provide an event name and a function."));
        }
        event = event.toLowerCase();
        if(that._events === undefined){ that._events = {}; }
        if(that._events[event] === undefined){ that._events[event] = []; }

        that._events[event].push({handler: callback, tag: tag});
    };

    f.addListener = f.on;

    f.off = function(event, callback){
        var that = this;
        
        if(!that._events){ return; }
        
        if(event){ event = event.toLowerCase(); }
        if(arguments.length === 0){
            that._events = {};
        }else if(arguments.length === 1){
            that._events[event] = [];
        }else{
            if(that._events && that._events[event]){
                that._events[event] = _.filter(that._events[event], function(val){
                    if(_.isFunction(callback)){
                        return(val.handler !== callback);                    
                    }else if(_.isString(callback)){
                        return(val.tag.toLowerCase() !== callback.toLowerCase());
                    }
                });
            }
        }
    };

    f.removeListener = f.off;

    f.once = function(event, callback){
        var that = this;
         
        function wrap() {
            that.off(event, wrap);
            callback.apply(this, arguments);
        };

        that.on(event, wrap);
    };

    f.emit = function(event){
        var that = this;
        var args = _.toArray(arguments);
        args.shift();
        
        if(!event){ throw(new Error("You must provide an event name.")); }
        event = event.toLowerCase();
        
        if(that._events && that._events[event]){
            _.each(that._events[event], function(val){
                val.handler.apply(null, args);
            });
        }
    };
    
    return(f);
};

return(eventEmitter);

};

