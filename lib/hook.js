"use strict";

exports.mixin = function(_){

var hooker = function(f){

    if(f === undefined){ f = {}; }
        
    f.hook_parent = _.rw("_hook_parent");

    f.hook = function(event, callback, is_error_handler){
        var self = this;
        if(!event || !callback){ _.fatal("You must provide an event name and a function."); }
        event = event.toLowerCase();
        if(self._hooks === undefined){ self._hooks = {}; }
        if(self._hooks[event] === undefined){ self._hooks[event] = []; }

        self._hooks[event].push({ handler: callback, is_error_handler: is_error_handler });
    };

    f.hooks = function(event){
        var hooks = [];
        var parent = this.hook_parent();
        if(parent){ hooks = parent.hooks(event); }

        if(this._hooks && this._hooks[event]){
            hooks = _.concat(hooks, this._hooks[event]);
        }

        return(hooks);
    };

    f.unhook = function(event, callback){
        var self = this;
        
        if(!self._hooks){ return; }
        
        if(!event || !callback){ _.fatal("You must provide an event name and a function."); }
        event = event.toLowerCase();

        if(self._hooks && self._hooks[event]){
            self._hooks[event] = _.filter(self._hooks[event], function(val){
                if(_.isFunction(callback)){
                    return(val.handler !== callback);                    
                }
            });
        }
    };

    f.bite = function(event, args, callback, timeout){
        var self = this;

        if(_.isFunction(args) && !callback){
            callback = args;
            args = [];
        }

        if(!_.isString(event) || !_.isFunction(callback)){
            _.fatal("You must provide an event name and a function.");
        }
        event = event.toLowerCase();
        
        var hooks = self.hooks(event);

        var error = null;
        _.each.async(hooks, function(val, key, next, end){
            // var to = _.timeout("Hook for event: " + event + " doesn't return in a timely manner, it probably forgot to call next.", 5000);

            if(error && !val.is_error_handler){ return next(); }

            function next_handler(err){

                if(error && !err){ error.swallowed = true; }
                else if(error && error !== err){ 
                    err.original = error;
                    err.rewritten = true;
                    error = err;
                }else if(err){ error = err; }

                next();
            }

            var handler = next_handler;
            if(timeout){ handler = _.timeout(next_handler, timeout); }

            var handler_args = _.concat(handler, args);
            if(val.is_error_handler){ handler_args.unshift(error); }

            val.handler.apply(null, handler_args);

        }, function(){
            if(error){ return callback(error); }
            else{ callback.apply(null, _.concat(null, args)); }
        });
    };
    
    return(f);
};

hooker.event_function = function(event){
    return(function(){
        var args = _.a(arguments);
        args.unshift(event);
        return(this.hook.apply(this, args));
    });
};

return(hooker);

};

