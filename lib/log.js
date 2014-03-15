
exports.mixin = function(_){

var log = function(){
    if(arguments.length && _.isObject(arguments[0])){
        var args = _.toArray(arguments);
        var options = args.unshift();
        console.log(_.format.apply(null, args));
    }else if(arguments.length){
        console.log(_.format.apply(null, arguments));
    }
    
    return({
        debug: _.noop, 
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

