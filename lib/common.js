"use strict";

// TODO: 
// - refactor mixin() to library(), and library.library it's a much better construct
// - write build script that takes advantage of the convention
//      - build(['common.js', 'uuid.js', 'sha256.js', 'hook.js'], './dry.underscore.js');
// - move expresso files to dry-test files

exports.mixin = function(_){

    _.a = function(a){ return(_.toArray(a)); };
    _.undef = function(x){ return(x === undefined); };
    _.date = function(ts){
        if(_.isNumber(ts)){
            return(new Date(ts));
        }else{
            return(new Date());
        }
    };

    _.timestamp = function(d){
        if(_.isNumber(d)){ return(_.timestamp() + d); }

        if(d === undefined){ d = _.date(); }
        return(d.getTime());
    };

    _.lc = function(s){
        return(s.toLowerCase());
    };

    _.isoDate = function(d){ 
        if(d === undefined){ d = _.date(); }
        return(_.moment(d).format("YYYY-MM-DD"));
    };

    _.ms = function(n){
        if(n === undefined){ return(0); }
        else{ return(n); }
    };
    _.ms.second = function(n){
        if(n === undefined){ n = 1; }
        return(n * _.ms(1000));
    };
    _.ms.minute = function(n){ 
        if(n === undefined){ n = 1; }
        return(n * _.ms.second(60));
    };
    _.ms.hour = function(n){ 
        if(n === undefined){ n = 1; }
        return(n * _.ms.minute(60));
    };
    _.ms.day = function(n){ 
        if(n === undefined){ n = 1; }
        return(n * _.ms.hour(24));
    };
    _.ms.week = function(n){ 
        if(n === undefined){ n = 1; }
        return(n * _.ms.day(7));
    };

    _.seconds = function(n){
        if(n === undefined){ return(0); }
        else{ return(n); }
    };

    _.seconds.durationString = function(secs){
        var minutes = Math.floor(secs / 60);          
        secs = secs % 60;
        var str = _.minutes.durationString(minutes);
        if(secs < 10){ secs = "0" + secs; }
        str = str + ":" + secs;
        return(str);
    };

    _.minutes = function(n){
        if(n === undefined){ return(0); }
        else{ return(n); }
    }
    _.minutes.hour = function(n){ 
        if(n === undefined){ n = 1; }
        return(n * _.minutes(60));
    };
    _.minutes.day = function(n){ 
        if(n === undefined){ n = 1; }
        return(n * _.minutes.hour(24));
    };
    _.minutes.week = function(n){ 
        if(n === undefined){ n = 1; }
        return(n * _.minutes.day(7));
    };
    _.minutes.durationString = function(min){
        var hours = Math.floor(min / 60);          
        var minutes = min % 60;
        if(minutes < 10){
            minutes = "0" + minutes;
        }

        return(hours + ":" + minutes);
    };
    _.minutes.timeString = function(min){
        var hours = Math.floor(min / 60);          
        var minutes = min % 60;
        var amPm = "AM";
        if(hours >= 12){ amPm = "PM"; }
        if(hours > 12){
            hours -= 12;
        }
        if(minutes < 10){
            minutes = "0" + minutes;
        }

        return(hours + ":" + minutes + " " + amPm);
    };

    _.wit = function(f){
        return(function(obj){
            f(obj);
            return(obj);
        });
    };

    var oldMax = _.max;
    _.max = function(a, b){
        if(_.isNumber(a) && _.isNumber(b)){
            if(a > b){ return(a); }
            else{ return(b); }
        }else{ return(oldMax.apply(_, arguments)); }
    };

    var oldMin = _.min;
    _.min = function(a, b){
        if(_.isNumber(a) && _.isNumber(b)){
            if(a < b){ return(a); }
            else{ return(b); }
        }else{ return(oldMin.apply(_, arguments)); }
    };
 
    _.omap = function(o, f){
        var result = {};
        _.each(o, function(val, key, callback){
            f(function(v, k){
                if(!k){ throw(_.exception("omap: key must be specified.")); }
                result[k] = v;
            }, val, key, o)
        });
        return(result);
    };

    _.plumb = function(goodF, badF, catchList){

        if(!badF){ _.fatal("NoPlunger", "We won't swallow errors. You need to provide an error callback."); }

        if(catchList && !_.isArray(catchList)){
            catchList = [catchList];
        }

        function shouldCatch(err){
            return(_.find(catchList, function(filter){
                if(_.isFunction(filter)){
                    return(filter(err));
                }else if(_.isString(filter)){
                    return(_.code(filter, err));
                }else{ return(false); }
            }));
        }

        return(function(err){
            var args = _.a(arguments);
            var argsSliced = args.slice(1);

            if(!err){ 
                if(catchList){ return goodF.apply(null, args); }
                else{ return goodF.apply(null, argsSliced); }
            }

            if(catchList && shouldCatch(err)){
                return goodF.apply(null, args);
            }else{
                return badF.apply(null, args);
            }
        });
    };

    _.bail = function(){
        var args = _.a(arguments);
        return(function(){
            var bailArgs = arguments;
            _.each(args, function(f, i){
                if(i === args.length-1){
                    return(f.apply(null, bailArgs));
                }else{ f(); }
            });
        });
    };

    _.concat = function(){ return(Array.prototype.concat.apply([], arguments)); };
    _.fatal = function(){ throw(_.exception("Fatal", "fatal: " + _.format.apply(null, arguments))); };
    _.error = function(code, message, extra){
        if(message === undefined && extra === undefined){ return(_.type(code, 'error')); }
        extra = extra || {};
        if(_.isObject(message)){
            var messageObj = message;
            message = message.message;
            extra = _.extend(messageObj, extra);
            if(!message){ message = "*mising error message*"; }
        }
        if(extra.message){ extra.originalMessage = extra.message; }
        if(extra.code){ extra.originalCode = extra.code; }
        return(_.extend({
            type: 'error',
            stack: (new Error(message)).stack
        }, extra, { code: code, message: message }));
    };

    _.exception = function(code, message, extra){
        if(message === undefined && extra === undefined){ return(_.type(code, 'exception')); }
        extra = extra || {};
        if(extra.message){ extra.originalMessage = extra.message; }
        if(extra.code){ extra.originalCode = extra.code; }
        return(_.extend({
            type: 'exception',
            stack: (new Error(message)).stack
        }, extra, { code: code, message: message }));
    };

    function errors_obj(h){ 
        this._errors = {};
        this.hash(h ? h : {});
    }

    errors_obj.prototype.add = function(code, message){
        if(!code){ _.fatal("error must have code."); }
        if(!message){ _.fatal("error must have message."); }
        this._errors[code] = message;
        this[code] = function(m, extra){
            if(_.isObject(m)){ extra = m; m = null; }
            return(_.error(code, m ? m : message, extra));
        };
    };

    errors_obj.prototype.hash = function(h){
        var self = this;
        if(!h){ return(_.jclone(this._errors)); }

        _.each(this._errors, function(v, k){ delete self[k]; });
        this._errors = {};
        _.each(h, function(v, k){ self.add(k, v); });
    };

    _.errors = function(h){ return(new errors_obj(h)); };

    _.propertyComparerMaker = function(property){
        return(function comparer(a, b){
            var args = _.a(arguments);
            if(args.length === 0){
                return(false);
            }else if(args.length === 1 && a && a[property]){
                return(a[property]);
            }else if(args.length == 2){
                if(_.isObject(a) && _.isObject(b)){
                    return(a[property] === b[property]);
                }else if(_.isObject(a) && (_.isString(b) || !_.isNumber(b))){
                    return(a[property] === b);
                }else if(_.isObject(b) && (_.isString(a) || !_.isNumber(a))){
                    return(b[property] === a);
                }else{ return(false); }
            }else{
                args.shift();
                return(_.find(args, function(val, i){
                    return(comparer(a, val));
                }));
            }
        });
    };

    _.type = _.propertyComparerMaker("type");
    _.code = _.propertyComparerMaker("code");

    _.jclone = function(o){ 
        return(_.parse(_.stringify(o)));
    };

    _.regex = function(str, flags){ return(new RegExp(str, flags)); };

    _.onceEvery = function(val, mod, hit, miss){
        if((val % mod) === 0 && hit){ hit(); }
        else if(miss){ miss(); }
    };

    _.render = function(templateName, hash){
        if(_.render.template(templateName)){
            return(_.render.template(templateName)(hash));
        }else{
            throw(_.exception("NoTemplate", "Tried to render template that doesn't exist: " + templateName));
        }
    };

    _.render.once = function(template, hash){
        return(_.hb.compile(template)(hash));
    };

    _.render.compile = function(templateName, template){
        _.render.templates[templateName] = _.hb.compile(template);
        return(_.render.templates[templateName]);
    };

    _.render.template = function(templateName){
        return(_.render.templates[templateName]);
    }
    
    _.render.templates = {};

    _.noop =  function(){};
    _.byteUnits = function(val){
        var unit = "B";
        if(val > 1024){
            val /= 1024;
            unit = "KB"
        }
        if(val > 1024){
            val /= 1024;
            unit = "MB"
        }
        if(val > 1024){
            val /= 1024;
            unit = "GB"
        }
        if(val > 1024){
            val /= 1024;
            unit = "TB"
        }
        return(val + " " + unit);
    };
    _.stringify = function(){ return(JSON.stringify.apply(null, arguments)); };
    _.parse = function(){ return(JSON.parse.apply(null, arguments)); };
    _.call = function(callback){
        if(!_.isFunction(callback)){ return(false); }
        if(arguments.length > 1){
            var args = _.toArray(arguments);
            args.shift();
            callback.apply(null, args);
            return(true);
        }else{ callback(); return(true); }
    };

    _.within = function(a, b, acceptableDiff){
        return(Math.abs(a-b) < acceptableDiff);
    };

    _.get = function(obj, key, defaultValue){
        if(_.isFunction(obj) && !key){ return(obj()); }
        if(key === undefined){ return(obj); }
        if(defaultValue !== undefined){
            if(!obj[key]){
                obj[key] = defaultValue;
                return(obj[key]);
            }else{
                return(obj[key]);
            }
        }
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
    };

    _.time = function(str, log){
        if(str === undefined){ return(new Date().getTime()); }

        if(!_.time.hash){ _.time.hash = {}; }
        var time = new Date().getTime();
        if(_.time.hash[str]){
            var t2 = _.time.hash[str];
            _.time.hash[str] = undefined;
            var val = time - t2;
            if(log){ _.stderr(str + ": ", val + "ms"); }
            return(val);
        }else{ _.time.hash[str] = time; }
    };
    
    // an order of magnitued cheaper than _.times
    // effectively as cheap as a for loop
    _.for = function(times, f){
        for(var i = 0; i < times; i++){ 
            if(f(i) === false){ break; }
        }
    };

    _.rfor = function(times, f){
        for(var i = times; i >= 0; i--){
            if(f(i) === false){ break; }
        }
    };

    _.timeout = function(f, ms, err){

        var ran = false;

        if(!_.isNumber(ms)){
            err = ms;
            ms = null;
        }

        if(_.isString(err)){
            err = { message: err };
        }

        var ms = ms || 1000;

        var token = setTimeout(function(){
            if(ran){ return; }
            ran = true;
            err = err || {};
            f(_.extend(_.error("Timeout", "Operation timed out."), err));
        }, ms);

        return(function(){
            if(ran){ return; }
            clearTimeout(token);
            ran = true;
            f.apply(this, arguments);
        });
    };

    _.isEmptyObjectWithNoPrototype = function(o){
        if(!_.isObject(o)){ return(false); }
        var isEmpty = true;
        for(var key in o){
            isEmpty = false;
            break;
        }
        return(isEmpty);
    };
    _.isObject = function(o){ return(o !== null && typeof(o) === 'object' && !_.isArray(o)); };
    _.stripLineBreaks = function(str) { return(str.replace(/[\r\n]/gi ,"")); };
    _.trimAndStripQuotes = function(str){
        str = _.trim(str);
        if(str[0] === "'" || str[0] === '"'){
            str = str.substr(1, str.length-1);
        }
        if(str[str.length-1] === "'" || str[str.length-1] === '"'){
            str = str.substr(0, str.length-1);
        }
        return(str);
    };
    _.lock = function(f){
        var running = false;

        function lock(){
            if(running){ return; }

            running = true;
            f.apply(null, arguments);
            running = false;
        }

        return(lock);
    };
 
    _.lock.ui = function(f){
        var running = false;
        var eventLock = function(e){
            if(running){ return e.preventDefault(); }
            else{ 
                running = true;
                f.call(this, e, function(){ running = false; }); 
            }
        };
        return(eventLock);
    };
    _.lock.async = function(f, lockTest, lockModify, lockRelease){
        var running = false;

        function lock(){
            var args = _.toArray(arguments);

            if(lockTest){
                var userTest = lockTest;
                var testArgs = _.toArray(arguments);
                lockTest = function(){ 
                    var testArgsCopy = _.toArray(testArgs);
                    testArgsCopy.unshift(running);
                    return(userTest.apply(null, testArgsCopy)); 
                };
            }else{
                lockTest = function(){ return(running); }; 
            }

            lockModify = lockModify || function(){ running = true; }
            lockRelease = lockRelease || function(){ running = false; };                

            if(lockTest()){ return; }
            lockModify(); 
            args.push(lockRelease);
            f.apply(this, args);
        }

        return(lock);

    };
    _.addProperties = function(o, propArray, val){
        _.each(propArray, function(prop){ o[prop] = val; });
        return(o);
    };
    _.walk = function(o, iterator, context){
        _.each(o, function(val, key, o){
            iterator.call(context, val, key, o);
            if(val && typeof(val) === 'object'){
                _.walk(val, iterator, context);
            }
        });
    };
    _.substitute = function(o, replacer, context){
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
    };
    _.isIterable = function(o){ return(_.isArray(o) || _.isObject(o)); };
    // breakable each, return(false) to stop iteration
    _.beach = function(a, f, c){ _.find(a, function(){ return(f.apply(this, arguments) === false); }, c); };
    _.each.async = function(o, iterator, complete, context){
        if(complete && !_.isFunction(complete)){
            context = complete;
            complete = null;
        }

        context = context || null;

        var keys = _.keys(o);

        var callComplete = function(){ _.nextTick(complete) };
        if(!complete){ callComplete = function(){}; }

        (function doWork(i){
            function callIterator(){ iterator.call(context, o[keys[i]], keys[i], function(){ doWork(i+1); }, callComplete); }
            if(i >= keys.length){ callComplete(); }
            else{
                if(((i + 1) % 30) === 0){ _.nextTick(callIterator); }
                else{ callIterator(); }
            }
        })(0);
    };
    _.fmap = function(o, mapf, context){
        return(_.filter(_.map(o, mapf, context), _.identity));
    };
    _.map.async = function(o, mapFunction, completedCallback, context){
        var results = [];

        completedCallback = completedCallback || _.noop;
        context = context || null;

        _.each.async(o, function(val, key, next){
                mapFunction.call(context, val, key, function(result){ results.push(result); next(); }); 
        }, function(){ completedCallback(results); });
    };
    _.filter.async = function(o, filterFunction, completedCallback, context){
        var results = [];

        completedCallback = completedCallback || _.noop;
        context = context || null;

        _.each.async(o, function(val, key, next){
                filterFunction.call(context, val, key, function(result){ if(result){ results.push(val); } next(); }); 
        }, function(){ completedCallback(results); });
    };

    _.rfilter = function(a, filterFunction){
        var results = [];

        _.rfor(a.length-1, function(i){
            if(filterFunction(a[i], i)){
                results.unshift(a[i]);
            }
        });

        return(results);
    };

    _.rmap = function(a, mapFunction){
        var results = [];

        _.rfor(a.length-1, function(i){
            results.unshift(mapFunction(a[i], i));
        });

        return(results);
    };

    _.memoize.async = function(f, cache){
        cache = cache || {};
        if(!cache.results){ cache.results = {}; }
        if(!cache.pending){ cache.pending = {}; }

        return(function(){
            var args = _.toArray(arguments);
            var callback = null;
            var hashKey = "";

            function sendResults(){
                cache.results[hashKey] = arguments;

                var pendingCallback = null;
                while(cache.pending[hashKey].length){
                    pendingCallback = cache.pending[hashKey].pop();
                    if(_.isFunction(pendingCallback)){
                        pendingCallback.apply(null, arguments);
                    }
                }
            }

            args = _.rmap(args, function(arg){
                if(_.isFunction(arg) && !callback){
                    callback = arg;
                    return(sendResults);
                }else{ 
                    hashKey += _.s(arg) + "|";
                    return(arg);
                }
            });

            if(cache.results[hashKey]){
                return callback.apply(null, arguments);
            }else if(cache.results[hashKey] === undefined){
                cache.results[hashKey] = null;
                cache.pending[hashKey] = [];
                cache.pending[hashKey].push(callback);
                f.apply(null, args);
            }else{
                cache.pending[hashKey].push(callback);
            }
        });
    };
 
    _.exists = function(col, target, insensitive){
        if(insensitive){
            return(_.any(col, function(a){ return(a.toLowerCase() === target.toLowerCase()); }));
        }else{
            return(_.any(col, function(a){ return(a === target); }));
        }
    };
    _.pad = function(str, n){
        if((n-str.length) > 0){
            return(str + Array(n-str.length).join(" "));
        }else{ return(str); }
    };
    _.removeElements = function(array, from, to) {
        var rest = array.slice((to || from) + 1 || array.length);
        array.length = from < 0 ? array.length + from : from;
        return array.push.apply(array, rest);
    };
    _.unionize = function(){
        var args = arguments;
        return(function(){
            var uargs = arguments;
            _.each(args, function(f){
                if(_.isFunction(f)){
                    f.apply(undefined, uargs);
                }
            });
        });
    };
    _.trim = function trim(str) {
        if(String.prototype.trim){
            return(String.prototype.trim.call(str)); 
        }else{
            str = str.replace(/^\s\s*/, '');
            var ws = /\s/;
            var i = str.length;
            while (ws.test(str.charAt(--i)));
            return str.slice(0, i + 1);
        }
    };
    _.getterSetter = function (variableName){
        return(function(val){
            if(val === undefined){ return(this[variableName]); }
            else{
                this[variableName] = val;
                return(this);
            }
        });
    };

    _.getter = function (variableName){
        return(function(){
            return(this[variableName]);
        });
    };

    _.r = _.getter;
    _.rw = _.getterSetter;

    _.inherit = function(childConstructor, parentConstructor){
        childConstructor.prototype = Object.create(parentConstructor.prototype);
        childConstructor.prototype.constructor = childConstructor;
    };

    // 10x slower than basic constructor 
    // makeClass - By Hubert Kauker (MIT Licensed)
    // original by John Resig (MIT Licensed).
    _.makeClass = (function(Void) {
        return function(){
            var constructor = function(){
                var init=constructor.prototype.init, 
                    hasInitMethod=(typeof init == "function"), 
                    instance;
                if ( this instanceof constructor ) {
                    if(hasInitMethod) init.apply( this, arguments );
                } else {
                    Void.prototype = constructor.prototype;
                    instance = new Void();
                    if(hasInitMethod) init.apply( instance, arguments );
                    return instance;
                }
            };
            return constructor;
        };
    })(function(){});

    // 4x slower than basic constructor
    // 2x slower than basic constructor
    // if you copy the init code below 
    // into your own constructor
    _.fastMakeClass = function(){
        return(function constructor(){
            if(this.init){
                this.init.apply(this, arguments);
            }
        });
    };
 
    _.toNumber = function(n){
        n = n - 0; 
        if(isNaN(n)){ return(null); }
        else{ return(n); }
    };
    _.n = function(n){ return(_.toNumber(n)); };
    _.s = function(n){ 
        if(arguments.length === 1 && _.isNumber(n)){
            return(n + "");
        }else{
            return(_.format.apply(null, arguments));
        }
    };
    _.formatNumber = function(nStr){
        nStr += '';
        var x = nStr.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    };
};

















