
exports.mixin = function(_){

    var logNs = [];
    // var options = { level: 'info' };
    var options = { level: 'debug' };

    var log = function(){

        function print(){ 
            var args = _.toArray(arguments);
            var ns = logNs.join(".");
            if(ns){ ns += ": "; }
            args.unshift(ns);
            console.log(_.format.apply(null, args));
        }

        if(arguments.length){
            var args = _.toArray(arguments);
            if(_.isObject(arguments[0])){
                _.extend(options, args.unshift());
            }
            print.apply(this, args);
        }

        var loggers = {};
        var logPriorities = ['emerg', 'alert', 'crit', 'error', 'warning', 'notice', 'info', 'debug'];

        var ignore = false;
        _.each(logPriorities, function(logName){
            if(ignore){ loggers[logName] = _.noop; }
            else{ loggers[logName] = log; }
            if(options.level.toLowerCase() == logName.toLowerCase()){ ignore = true; }
        });
        
        return(loggers);
    };

    log.push = function(ns){ logNs.push(ns); };
    log.pop = function(){ return(logNs.pop()); };
    log.wrap = function(ns, f){
        return(function(){
            log.push(ns);
            var val = f.apply(this, arguments);
            log.pop();
            return(val);
        });
    };
            
    return(log);
};

