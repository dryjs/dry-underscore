
exports.mixin = function(_){
   _.mixin({
        noop: function(){},
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
        isIterable : function(o){ return(_.isArray(o) || _.isObject(o)); },
        eachAsync : function(o, iterator, complete, context){
            if(complete && !_.isFunction(complete)){
                context = complete;
                complete = null;
            }
            
            var keys = _.keys(o);
          
            var callComplete = function(){ process.nextTick(complete) };
            if(!complete){ callComplete = function(){}; }

            (function doWork(i){
                if(i >= keys.length){ callComplete(); }
                else{
                    function callIterator(){ iterator.call(context, o[keys[i]], keys[i], function(){ doWork(i+1); }, callComplete); }

                    if(((i + 1) % 30) === 0){ process.nextTick(callIterator); }
                    else{ callIterator(); }
                }
            })(0);
        },
        find : function(col, target, insensitive){
            if(!insensitive && _.isArray(col)){
                return(_.indexOf(col, target));
            }
        },
        exists : function(col, target, insensitive){
            if(insensitive){
                return(_.any(col, function(a){ return(a.toLowerCase() === target.toLowerCase()); }));
            }else{
                return(_.any(col, function(a){ return(a === target); }));
            }
        },
        join_path: function(){
            var a = _.toArray(arguments);

            var result = [];
            var startSlash = false;  
            var endSlash = false;

            if(a.length > 0 && a[0].length > 0 && a[0][0] === "/"){ startSlash = true; }
            if(a.length > 0 && a[a.length-1].length > 0 && a[a.length-1][a[a.length-1].length-1] === "/"){ endSlash = true; }

            _.each(a, function(part){ 
                var sp = part.split('/'); 
                sp = _.filter(sp, function(a){ return(a != ""); });
                _.each(sp, function(unit){ result.push(unit); });
            });

            result = result.join('/');
            
            if(startSlash){ result = "/" + result; }
            if(endSlash){ result += "/"; }

            return(result);
        },
        removeElements: function(array, from, to) {
            var rest = array.slice((to || from) + 1 || array.length);
            array.length = from < 0 ? array.length + from : from;
            return array.push.apply(array, rest);
        }
   });
};
