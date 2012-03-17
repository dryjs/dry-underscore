var _ = require('../deps/underscore');
_.str = require('../deps/underscore.string');
_.mixin(_.str.exports());
_.mixin({
    get: function(obj, key){
        for (var prop in obj){
            if(_.has(obj, prop) && prop.toLowerCase() === key.toLowerCase()){
                return obj[prop];
            }
        }
        return undefined;
    },
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
    }
});

for(var p in _){
    exports[p] = _[p];
}
