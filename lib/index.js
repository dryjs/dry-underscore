var _ = require('../deps/underscore');
_.str = require('../deps/underscore.string');
_.mixin(_.str.exports());
_.mixin({
    get: function(obj, key){
        if(obj[key] !== undefined){
            if(_.isFunction(obj[key])){ return(obj[key]()); }
            else{ return(obj[key]); }
        }else{
            for (var prop in obj){
                if(_.has(obj, prop) && prop.toLowerCase() === key.toLowerCase()){
                    return obj[prop];
                }
            }
            return undefined;
        }
    },
    isObject : function(o){ return(o !== null && typeof(o) === 'object' && !_.isArray(o)); },
    stripLineBreaks : function(str) { return(str.replace(/[\r\n]/gi ,"")); },
    recursionLock : function(f){
        var running = false;
        
        function lock(){
            if(running){ return; }
        
            running = true;
            f.apply(null, arguments);
            running = false;
        }
        
        return(lock);
    },
    addProperties : function(o, propArray, val){
        _.each(propArray, function(prop){ o[prop] = val; });
    },
    walk : function(o, iterator, context){
        _.each(o, function(val, key, o){
            iterator.call(context, val, key, o);
            if(val && typeof(val) === 'object'){
                _.walk(val, iterator, context);
            }
        });
    },
    substitute : function(o, replacer, context){
        _.each(o, function(val, key, o){
            var newVal = replacer.call(context, val, key, o);
            if(newVal !== undefined){
                o[key] = newVal;
                val = newVal;
            }
            if(val && typeof(val) === 'object'){
                _.substitute(val, replacer, context);
            }
        });
    },
    isIterable : function(o){ return(_.isArray(o) || _.isObject(o)); }
});

for(var p in _){
    exports[p] = _[p];
}
