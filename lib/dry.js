
exports.mixin = function(_){

var dry = {};

dry.isModelHash = function(m){ return(_.isObject(m) && m.Type && !_.isFunction(m.Instantiated)); };
dry.isModel = function(m){ return(_.isObject(m) && m.Type && _.isFunction(m.Instantiated)); };

dry.hasType = hasType;

function hasType(val, types, nullOk){
    var messages = [];
    
    if(Array.isArray(val)){
        messages.push('Expected object, found array');
        return(messages);
    }
    
    if(types === 'object' || (typeof(val) !== 'object' && !Array.isArray(types))){
        if(typeof(val) !== types){
            messages.push("Expected type: " + types);
        }
        return(messages);
    }
    
    if(!_.isArray(types)){ types = [types]; }
    
    if(!(nullOk && val === null)){
        if(!(val && _.isObject(val) && val.Type && _.exists(types, val.Type, true))){
            messages.push("Expected any of the following types: [" + types + "]");
        }
    }

    return(messages);
};

dry.hasTypes = hasTypes;

function hasTypes(val, types, nullOk){
    var messages = [];
    
    if(!_.isArray(val)){
        messages.push('Expected array, found object');
        return(messages);
    }

    for(var i = 0; i < val.length; i++){
        if(hasType(val[i], types, nullOk).length > 0){
            messages.push("Expected any of the following types: [" + types + "] in array position: " + i);
            return(messages);
        }
    }

    return(messages);
};

return(dry);

};

