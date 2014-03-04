
exports.mixin = function(_){

var log = function(){
    if(arguments.length && _.isObject(arguments[0])){
        var args = _.toArray(arguments);
        var options = args.unshift();
    }else{
        console.log.apply(console, arguments);
    }
    
    return({
        debug: log, 
        info: log,
        notice: log,
        warning: log,
        error: log,
        crit: log,
        alert: log,
        emerg: log,
    });
};


return(log);

};

