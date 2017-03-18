
exports.mixin = function(_){

    _.stdout = function(){
        var entry = _.format.apply(null, arguments);
        console.log(entry);
    };

    _.stderr = function(){
        var entry = _.format.apply(null, arguments);
        console.log(entry);
    };

    _.p = _.stderr;
    
    _.nextTick = (function() {

        if(!window.postMessage && !window.addEventListener){
            return(function(f) { setTimeout(f, 0); });
        }else{

            var timeouts = [];
            var messageName = "zero-timeout-message";
        
            // Like setTimeout, but only takes a function argument.  There's
            // no time argument (always zero) and no arguments (you have to
            // use a closure).
            function nextTick(fn) {
                timeouts.push(fn);
                window.postMessage(messageName, "*");
            }
        
            function handleMessage(event) {
                if (event.source == window && event.data == messageName) {
                    event.stopPropagation();
                    if (timeouts.length > 0) {
                        var fn = timeouts.shift();
                        fn();
                    }
                }
            }
        
            window.addEventListener("message", handleMessage, true);

            return(nextTick);
        }

    })();

    _.client = {};
    _.client.labelOverInput = _.removed("_.client.labelOverInput");

    _.container = _.deprecated("_.container", function(root){

        root.container = function(selector, change_callback){ 
            this._container_selector = selector;
            this._change_callback = change_callback;
            return(this);
        };

        root.show = function(flag){ 
            if(flag === false){ return this.hide.apply(this, _.concat(true, _.rest(arguments))); }
            if(this._container_selector){ 
                $(this._container_selector).removeClass("hide");
                if(this._change_callback){ 
                    this._change_callback.apply(null, _.concat(true, _.rest(arguments)));
                }
            }
        };

        root.hide = function(flag){ 
            if(flag === false){ return this.show.apply(this, _.concat(true, _.rest(arguments))); }
            if(this._container_selector){ 
                $(this._container_selector).addClass("hide");
                if(this._change_callback){ 
                    this._change_callback.apply(null, _.concat(false, _.rest(arguments)));
                }
            }
        };

        root.$ = function(selector, no_space){
            return($(this._container_selector + (no_space ? "" : " ") + (selector ? selector : "")));
        };
    });

    return(_);

};

