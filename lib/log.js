
exports.mixin = function(_){

var log = function(){
    if(arguments.length && _.isObject(arguments[0])){
        var args = _.toArray(arguments);
        var options = args.unshift();
    }else{
        console.log.apply(null, arguments);
    }
    
    return({
        debug: function(msg, data){ console.log(msg); if(data) { console.dir(data); } },
        info: function(msg, data){ console.log(msg); if(data) { console.dir(data); } },
        notice: function(msg, data){ console.log(msg); if(data) { console.dir(data); } },
        warning: function(msg, data){ console.log(msg); if(data) { console.dir(data); } },
        error: function(msg, data){ console.log(msg); if(data) { console.dir(data); } },
        crit: function(msg, data){ console.log(msg); if(data) { console.dir(data); } },
        alert: function(msg, data){ console.log(msg); if(data) { console.dir(data); } },
        emerg: function(msg, data){ console.log(msg); if(data) { console.dir(data); } }
    });
};


return(log);

};

