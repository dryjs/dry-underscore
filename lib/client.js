
exports.mixin = function(_){

    _.stdout = function(){
        var entry = _.format.apply(null, arguments);
        console.log(entry);
    };

    _.stderr = function(){
        var entry = _.format.apply(null, arguments);
        console.log(entry);
    };

    _.sout = _.stdout;
    _.serr = _.stderr;
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

    _.client.labelOverInput = function(inputSelector, labelSelector){

        if(inputSelector === undefined){ _.fatal("need at least one selector for this to work."); }

        var parentSelector = "";
        if(labelSelector === undefined){
            parentSelector = inputSelector;
            inputSelector = "";
        }

        labelSelector = labelSelector || (parentSelector + " label");

        if(parentSelector){
            if($(parentSelector + " textarea").first()){
                inputSelector = parentSelector + " textarea";
            }

            if($(parentSelector + " input").first()){
                inputSelector = parentSelector + " input";
            }
        }

        $(labelSelector).click(function(e){
            $(inputSelector).focus();
        });

        $(inputSelector).focus(function(){
            $(labelSelector).hide();
        });

        $(inputSelector).blur(function(){
            if(!$(this).val()){ 
                $(labelSelector).show();
            }
        });
    };


    return(_);

};

