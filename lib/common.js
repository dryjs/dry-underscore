"use strict";

// TODO: in progress
// - support camel case and underscore case
//
// TODO: 
// - refactor mixin() to library(), and library. it's a much better construct
// - write build script that takes advantage of the convention
//      - build(['common.js', 'uuid.js', 'sha256.js', 'hook.js'], './dry.underscore.js');
// - move expresso files to mocha qunit files
// - get as much coverage reporting as possible with istanbul

exports.mixin = function(_){

    _.support_underscores = function(lib){
        _.each(lib, function(val, key){
            if(!_.isFunction(val)){ return; }
            var name_underscored = _.str.underscored(key);
            if(name_underscored !== key){
                if(lib[name_underscored]){ 
                    throw(_.error("NameConflict", "name: " + key + " underscored: " + name_underscored + " confilicts with name already in use: " + name_underscored));
                }else{
                    lib[name_underscored] = val;
                }
            }
        });
    };

    _.support_underscores(_);

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
        return(d.valueOf());
    };

    _.lc = function(s){
        return(s.toLowerCase());
    };

    _.isoDate = _.iso_date = function(d){ 
        if(d === undefined){ d = _.date(); }
        if(_.isString(d)){
            var m = _.moment(d, "YYYY-MM-DD");
            if(m.isValid()){ return(m); }
            else{ return(null); }
        }
        return(_.moment(d).format("YYYY-MM-DD"));
    };

    function decimalAdjust(type, value, exp) {
        // If the exp is undefined or zero...
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        // If the value is not a number or the exp is not an integer...
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        // Shift
        value = value.toString().split('e');
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

    _.round = function(value, exp) {
        return decimalAdjust('round', value, exp);
    };

    _.floor = function(value, exp) {
        return decimalAdjust('floor', value, exp);
    };

    _.ceil = function(value, exp) {
        return decimalAdjust('ceil', value, exp);
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

    _.seconds.durationString = _.seconds.duration_string = function(secs){
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
    _.minutes.durationString = _.minutes.duration_string = function(min){
        var hours = Math.floor(min / 60);          
        var minutes = min % 60;
        if(minutes < 10){
            minutes = "0" + minutes;
        }

        return(hours + ":" + minutes);
    };
    _.minutes.humanDuration = _.minutes.human_duration = function(min){
        var hours = Math.floor(min / 60);          
        var minutes = min % 60;

        var text = "";
        if(hours > 0){
            text += hours + " hour"
            if(hours > 1){ text += "s"; }
        }

        if(minutes > 0){
            if(text){ text += " "; }
            text += minutes + " minute";
            if(minutes > 1){ text += "s"; }
        }

        return(text);
    };
    _.minutes.timeString = _.minutes.time_string = function(min, twenty_four){
        min = (min % _.minutes.day());

        var hours = Math.floor(min / 60);          
        var minutes = min % 60;

        if(minutes < 10){ minutes = "0" + minutes; }

        if(twenty_four){ return(hours + ":" + minutes); }

        var am_pm = (hours < 12 ? "AM" : "PM");

        if(hours > 12){ hours -= 12; }

        return(hours + ":" + minutes + " " + am_pm);
    };

    _.wit = function(f){
        return(function(obj){
            f(obj);
            return(obj);
        });
    };


    _._min = _.min;
    _._max = _.max;

    var min_value = function(a, b){
        if(a < b){ return(a); }
        else{ return(b); }
    };

    var max_value = function(a, b){
        if(a > b){ return(a); }
        else{ return(b); }
    };

    var array_compare = function(a, comp_f, converter_f){
        var val = null;
        var converted_val = null;

        _.each(a, function(new_val){
            var converted_new_val = converter_f(new_val);

            if(val === null){ 
                val = new_val;
                converted_val = converted_new_val;
            }

            var result = comp_f(converted_val, converted_new_val);
            if(result === converted_new_val){
                val = new_val;
                converted_val = converted_new_val;
            }
        });

        return(val);
    }

    var get_converter_function = function(v){
        var converter_f = null;
        if(_.isString(v)){ converter_f = _.property(v); }
        else if(_.isFunction(v)){ converter_f = v; }
        else{ converter_f = function(a){ return(a); }; }
        return(converter_f);
    };

    _.isComparable = function(a){ return(_.isString(a) || _.isNumber(a)); }

    _.max = function(a, b, converter_f){
        if(_.isArray(a)){
            converter_f = get_converter_function(b);
            return(array_compare(a, max_value, converter_f));
        }else{

            converter_f = get_converter_function(converter_f);
            var converted_a = converter_f(a);
            var converted_b = converter_f(b);

            if(!_.isComparable(converted_a) || !_.isComparable(converted_b)){ return(null); }

            if(converted_a === max_value(converted_a, converted_b)){ return(a); }
            else{ return(b); }
        }
    };

    _.min = function(a, b, converter_f){
        var max_val = null;

        if(_.isArray(a)){
            converter_f = get_converter_function(b);
            return(array_compare(a, min_value, converter_f));
        }else{
            converter_f = get_converter_function(converter_f);
            var converted_a = converter_f(a);
            var converted_b = converter_f(b);

            if(!_.isComparable(converted_a) || !_.isComparable(converted_b)){ return(null); }

            if(converted_a === min_value(converted_a, converted_b)){ return(a); }
            else{ return(b); }
        }
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

    _.plumb = _.pb = function(goodF, badF, catchList){

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
        if(extra.message){ 
            extra.originalMessage = extra.message;
            extra.original_message = extra.message;
        }
        if(extra.code){ 
            extra.originalCode = extra.code;
            extra.original_code = extra.code;
        }
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

    // comp(obj) -> obj[prop]
    // comp(obj, val) -> obj[prop] === val
    // comp(obj_one, obj_two) -> obj_one[prop] === obj_two[prop]
    // comp(val, obj) -> obj[prop] === val
    // comp(obj, val_one, val_two, val_three) -> obj[prop] === val_one || obj[prop] === val_two || obj[prop] === val_three
    // comp(obj_one, obj_two, val_one, obj_three) -> obj_one[prop] === obj_two[prop] || obj_one[prop] === val_one || obj_one[prop] === obj_three[prop]
    _.propertyComparer = _.property_comparer = function(property){
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
                }) !== undefined);
            }
        });
    };

    _.code = _.property_comparer("code");

    _.basicType = _.basic_type = function(o){
        if(o === undefined){ return("undefined"); }
        if(o === null){ return("null"); }
        if(_.isArray(o)){ return("array"); }
        if(_.isString(o)){ return("string"); }
        if(_.isNumber(o)){ return("number"); }
        if(_.isObject(o)){ return("object"); }
    };

    _.dryType = _.dry_type = function(o){
        var t = _.basic_type(o);
        if(t === "object" && _.isString(o["type"])){
            return(o["type"]);
        }else{ return(t); }
    };

    _.dryTypes = _.dry_types = function(o, recursive){
        if(!_.isArray(o)){ return(_.dry_type(o)); }
        var types = [];
        _.each(o, function(elem){
            if(recursive && _.isArray(elem)){
                types.push(_.dry_types(elem, recursive));
            }else{
                var type = _.dry_type(elem);
                if(!_.contains(types, type)){ types.push(type); }
            }
        });
        return(types);
    };

    var type_comparer = _.property_comparer("type");

    _.type = function(o){
        if(arguments.length <= 1){ return(_.dry_type(o)); }
        else{ return(_.type_match.apply(this, arguments)); }
    };

    _.type_match = function(o){
        var type = _.dry_type(o);
        return(_.find(_.rest(arguments), function(test_type){
            if(test_type === "*"){ return(true); }
            return(type === test_type);
        }) !== undefined);
    };

    _.types = function(o){
        if(arguments.length <= 1){ return(_.dry_types(o)); }
        if(arguments.length === 2 && _.last(arguments) === true){ return(_.dry_types(o, true)); }
        if(arguments.length === 2 && _.last(arguments) === false){ return(_.dry_types(o, false)); }
        else{ return(_.types_match.apply(this, arguments)); }
    };

    _.types_match = function(o){
        var tests = _.rest(arguments);
        var recursive = _.last(tests) === true;
        if(recursive){ tests.pop(); }

        if(!_.isArray(o)){ return(_.type_match.apply(this, arguments)); }

        return(_.find(tests, function(test){
            if(!_.isArray(test)){ return(false); }
            return(_.every(o, function(elem){

                var type = _.dry_type(elem);

                return(_.find(test, function(test_type){
                    if(recursive && _.isArray(elem)){ 
                        return(_.types_match.call(null, elem, test_type, recursive));
                    }else{
                        return(type === test_type || test_type === "*");
                    }
                }) !== undefined);
            }));
        }) !== undefined);
    };

    _.isModel = _.is_model = function(m){ return(_.isObject(m) && m.type && _.isFunction(m.instantiated)); };
    _.isModelHash = _.is_model_hash = function(m){ return(_.isObject(m) && m.type && !_.isFunction(m.instantiated)); };

    _.jclone = function(o){ 
        return(_.parse(_.stringify(o)));
    };

    _.regex = function(str, flags){ return(new RegExp(str, flags)); };

    function make_regex_special_character_matcher(){
        // order matters for the first 3
        // order doesn't matter for the rest
        var specials = [ "-" , "[" , "]" , "/" , "{" , "}" , "(" , ")" , "*" , "+" , "?" , "." , "\\" , "^" , "$" , "|" ];

        // I choose to escape every character with '\'
        // even though only some strictly require it when inside of []
        var special_character_matcher = _.regex('[' + specials.join('\\') + ']', 'g');
        return(special_character_matcher);
    }

    var regex_special_character_matcher = make_regex_special_character_matcher();

    _.escapeRegex = _.escape_regex = function(str){
        return str.replace(regex_special_character_matcher, "\\$&");
    };

    _.onceEvery = _.once_every = function(val, mod, hit, miss){
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
    _.byteUnits = _.byte_units = function(val){
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
        a = Math.abs(a);
        b = Math.abs(b);
        return(Math.abs(a-b) < acceptableDiff);
    };

    _.get = function(obj, key){

        if(obj[key] !== undefined){ return obj[key]; }

        for (var prop in obj){
            if(_.has(obj, prop) && prop.toLowerCase() === key.toLowerCase()){
                return obj[prop];
            }
        }

        return undefined;
    };

    _.define = _.def = function(obj, key, defaultValue){
        if(key === undefined){ return(obj); }
        if(obj[key] === undefined){
            obj[key] = defaultValue;
            return(obj[key]);
        }else{
            return(obj[key]);
        }
    };

    _.time = function(log_str){
        var start_time = (new Date()).valueOf();
        return(function(quiet){
            var end_time = (new Date()).valueOf();
            var elapsed_time = end_time - start_time;
            if(!quiet){ _.stderr(log_str + ": ", elapsed_time + "ms"); }
            return(elapsed_time);
        });
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

        var stack = (new Error()).stack;
        var token = setTimeout(function(){
            if(ran){ return; }
            ran = true;
            err = err || {};
            f(_.extend(_.error("Timeout", "Operation timed out.", { stack: stack }), err));
        }, ms);

        return(function(){
            if(ran){ return; }
            clearTimeout(token);
            ran = true;
            f.apply(this, arguments);
        });
    };

    _.isObject = _.is_object = function(o){ return(o !== null && typeof(o) === 'object' && !_.isArray(o)); };
    _.stripLineBreaks = _.strip_line_breaks = function(str) { return(str.replace(/[\r\n]/gi ,"")); };
    _.stripQuotes = _.strip_quotes = function(str){
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
    _.addProperties = _.add_properties = function(o, propArray, val){
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
    _.remove = function(array, from, to) {
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
    _.getterSetter = _.getter_setter = function (variableName){
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

    _.toNumber = _.to_number = function(n, rnd){
        if(_.is_string(n)){ n = _.trim(n); }
        else if(!_.is_number(n)){ return(null); }

        if(n === ""){ return(null); }

        n = n - 0; 
        if(isNaN(n)){ return(null); }
        if(rnd !== undefined){ return(_.str.toNumber(n, rnd)); }
        else{ return(n); }
    };

    _.n = _.to_number;
    _.s = function(n){ 
        if(arguments.length === 1 && _.isNumber(n)){
            return(n + "");
        }else{
            return(_.format.apply(null, arguments));
        }
    };
    _.formatNumber = _.format_number = function(nStr){
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

    _.numbers = function(str_or_a){
        var numbers = _.filter(str_or_a, function(char){ return(_.to_number(char) !== null); });
        if(_.is_string(str_or_a)){
            return(numbers.join(""));
        }else{ return(numbers); }
    };

    (function(){
        var pSlice = Array.prototype.slice;
        var objectKeys =  _.keys;
        var isArguments = {}; 
        (function(){
            var supportsArgumentsClass = (function(){
                return Object.prototype.toString.call(arguments)
            })() == '[object Arguments]';

            isArguments = supportsArgumentsClass ? supported : unsupported;

            isArguments.supported = supported;
            function supported(object) {
                return Object.prototype.toString.call(object) == '[object Arguments]';
            };

            isArguments.unsupported = unsupported;
            function unsupported(object){
                return object &&
            typeof object == 'object' &&
            typeof object.length == 'number' &&
            Object.prototype.hasOwnProperty.call(object, 'callee') &&
            !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
            false;
            };
        })();

        var deepEqual = null;
        (function(){
            deepEqual = function (actual, expected, opts) {
                if (!opts) opts = {};
                // 7.1. All identical values are equivalent, as determined by ===.
                if (actual === expected) {
                    return true;

                } else if (actual instanceof Date && expected instanceof Date) {
                    return actual.valueOf() === expected.valueOf();

                    // 7.3. Other pairs that do not both pass typeof value == 'object',
                    // equivalence is determined by ==.
                } else if (typeof actual != 'object' && typeof expected != 'object') {
                    return opts.strict ? actual === expected : actual == expected;

                    // 7.4. For all other Object pairs, including Array objects, equivalence is
                    // determined by having the same number of owned properties (as verified
                    // with Object.prototype.hasOwnProperty.call), the same set of keys
                    // (although not necessarily the same order), equivalent values for every
                    // corresponding key, and an identical 'prototype' property. Note: this
                    // accounts for both named and indexed properties on Arrays.
                } else {
                    return objEquiv(actual, expected, opts);
                }
            }

            function isUndefinedOrNull(value) {
                return value === null || value === undefined;
            }

            function isBuffer (x) {
                if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
                if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
                    return false;
                }
                if (x.length > 0 && typeof x[0] !== 'number') return false;
                return true;
            }

            function objEquiv(a, b, opts) {
                var i, key;
                if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
                    return false;
                // an identical 'prototype' property.
                if (a.prototype !== b.prototype) return false;
                //~~~I've managed to break Object.keys through screwy arguments passing.
                //   Converting to array solves the problem.
                if (isArguments(a)) {
                    if (!isArguments(b)) {
                        return false;
                    }
                    a = pSlice.call(a);
                    b = pSlice.call(b);
                    return deepEqual(a, b, opts);
                }
                if (isBuffer(a)) {
                    if (!isBuffer(b)) {
                        return false;
                    }
                    if (a.length !== b.length) return false;
                    for (i = 0; i < a.length; i++) {
                        if (a[i] !== b[i]) return false;
                    }
                    return true;
                }
                try {
                    var ka = objectKeys(a),
                        kb = objectKeys(b);
                } catch (e) {//happens when one is a string literal and the other isn't
                    return false;
                }
                // having the same number of owned properties (keys incorporates
                // hasOwnProperty)
                if (ka.length != kb.length)
                    return false;
                //the same set of keys (although not necessarily the same order),
                ka.sort();
                kb.sort();
                //~~~cheap key test
                for (i = ka.length - 1; i >= 0; i--) {
                    if (ka[i] != kb[i])
                        return false;
                }
                //equivalent values for every corresponding key, and
                //~~~possibly expensive deep test
                for (i = ka.length - 1; i >= 0; i--) {
                    key = ka[i];
                    if (!deepEqual(a[key], b[key], opts)) return false;
                }
                return true;
            }
        })();

        _.deep_equal = function(actual, expected, strict){
            return(deepEqual(actual, expected, { strict: strict !== false }));
        };
    })();

};

















