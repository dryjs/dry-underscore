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
                    throw(_.error("name_conflict", "name: " + key + " underscored: " + name_underscored + " confilicts with name already in use: " + name_underscored));
                }else{
                    lib[name_underscored] = val;
                }
            }
        });
    };

    _.support_underscores(_);

    _.fatal = function(){ throw(_.exception("Fatal", "fatal: " + _.format.apply(null, arguments))); };
    _.error = function(code, message, extra){
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
        return(_.error(code, message, _.extend({}, extra, { type: 'exception' })));
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

    _.error.message = function(err, add_context, exit_on_error){
        if(!_.isArray(err)){ return(_.error._message(err, add_context, exit_on_error)); }

        var error_messages = "";

        var uuid = _.uuid();
        var err_count = 0;
        err = _.flatten(err);
        _.each(err, function(e){
            if(!_.isObject(e)){ return; }
            err_count++;
            error_messages += "\n";
            error_messages += _.error._message(e, add_context, false);
            error_messages += "\n";
        });

        var message = "start error stack: " + uuid;
        if(err_count === 0){
            message += "\nthere was an error array passed to _.error.message, but it didn't contain any errors: " + _.format(err);
        }else{
            message += ", " + err_count + " errors encountered.\n" + error_messages;
        }
        message += "end error stack: " + uuid + (exit_on_error ? ", process exiting." : "")

        return(message);
    };
        
    _.error._message = function(err, add_context, exit_on_error){

        var error_message = _.string_builder();

        var uuid = _.uuid();

        error_message.add_line("start error: " + uuid);

        if(err.code){ error_message.add_line("code: ", err.code); }
        if(err.message){ error_message.add_line("message: ", err.message); }
        if(err.original_message){ error_message.add_line("original message: ", err.original_message); }

        if(add_context){ add_context(error_message); }

        if(err.stack){
            var just_stack = err.stack.toString().split("\n");
            just_stack.shift()
            just_stack = just_stack.join("\n");
            error_message.add_line("occurred: \n", just_stack); }
        else{ 
            error_message.add_line("object (no stack): ", err);
        }

        error_message.add_line("end error: ", uuid, (exit_on_error ? ", process exiting." : ""));

        return(error_message.string());
    };

    _.deprecated = function(f_name, f){
        return(function(){
            console.log("WARNING: _." + f_name + "has been deprecated and will be removed in the next major version.");
            return(f.apply(this, arguments));
        });
    };

    _.removed = function(f_name){
        var f = function(){ _.fatal(f_name + " was removed in the last major release of the library."); }
        return(f);
    };

    _.a = function(a){ return(_.toArray(a)); };
    _.concat = function(){ return(Array.prototype.concat.apply([], arguments)); };

    _.undef = function(x){ return(x === undefined); };
    _.date = function(ts){
        if(_.isNumber(ts)){
            return(new Date(ts));
        }else{
            return(new Date());
        }
    };

    _.deep_equal = function(actual, expected){
        return(_.diff(actual, expected) === undefined);
    };

    _.sum = function(a){ 
        return(_.reduce(a, function(memo, num){ 
            num = _.n(num);
            if(num === null){ return(memo); }
            else{ return(memo + num); }
        }, 0));
    };

    _.eq = _.curry(_.deep_equal);
    _.ne = _.curry(function(a, b){ return(!_.deep_equal(a, b)); });
    _.lt = _.curry(function(value, other){ return(value < other); });
    _.lte = _.curry(function(value, other){ return(value <= other); });
    _.gt = _.curry(function(value, other){ return(value > other); });
    _.gte = _.curry(function(value, other){ return(value >= other); });

    _.propCompare = _.prop_compare = _.propertyCompare = _.property_compare = _.curry(function(comparer, key, value, obj){ 
        return(comparer(value, obj[key]));
    });

    _.id = _.identity;

    // TODO: var match_user_or_admin = _.prop_eq("type", ["user, "admin"]);
    // this is getting pretty crazy, like to the limit of my understanding, I think we should simplify
    // and if I want _.code to be super complicated, just make it a one off, this is too generic, i have to look at the source to figure out what it does

    _.propEq = _.prop_eq = _.property_eq = _.propertyEq = _.property_compare(_.eq);
    _.propNe = _.prop_ne = _.property_ne = _.propertyNe = _.property_compare(_.ne);

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

    _.timestamp = function(d){
        if(_.isNumber(d)){ return(_.timestamp() + d); }

        if(d === undefined){ d = _.date(); }
        return(d.valueOf());
    };

    _.isoDate = _.iso_date = function(d, tz){ 
        if(d === undefined){ d = _.date(); }
        var iso_format = "YYYY-MM-DD";

        if(d && tz){ return(_.moment.tz(d, iso_format, true, tz)); }

        if(_.isString(d)){
            if(_.moment.tz && _.moment.tz.zone(d)){ return(_.moment.tz(d).format(iso_format)); }
            else{
                var m = _.moment(d, iso_format, true);
                if(m.isValid()){ return(m); }
                else{ return(null); }
            }
        }
        return(_.moment(d).format(iso_format));
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
        return decimalAdjust('round', value, (exp ? -exp : 0));
    };

    _.floor = function(value, exp) {
        return decimalAdjust('floor', value, (exp ? -exp : 0));
    };

    _.ceil = function(value, exp) {
        return decimalAdjust('ceil', value, (exp ? -exp : 0));
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
            text += hours + " hour";
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
        if(hours === 0){ hours = 12; }

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
        _.each(o, function(val, key){
            f(function(v, k){ result[k || key] = v; }, val, key, o)
        });
        return(result);
    };

    _.replace = function(str, match, val, once){
        if(once){ return(str.replace(match, val)); }
        else{ return(str.replace(_.regex(_.escape_regex(match), "g"), val)); }
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

    _.basicType = _.basic_type = function(o){
        if(o === undefined){ return("undefined"); }
        if(o === null){ return("null"); }
        if(_.isBoolean(o)){ return("boolean"); }
        if(_.isArray(o)){ return("array"); }
        if(_.isString(o)){ return("string"); }
        if(_.isNumber(o)){ return("number"); }
        if(_.isObject(o)){ return("object"); }
    };

    _.basic_type.types = ["undefined", "null", "boolean", "array", "string", "number", "object"];

    _.dryType = _.dry_type = function(o){
        var t = _.basic_type(o);
        if(t === "object" && _.isString(o["type"])){
            var t = o["type"];

            if(_.contains(_.basic_type.types, t)){
                return("object");
            }else{
                return(o["type"]);
            }

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

    _.type = function(o){
        if(arguments.length <= 1){ return(_.dry_type(o)); }
        else{ return(_.type_match.apply(this, arguments)); }
    };

    _.type_match = function(o, types, map_types){
        var dry_type = _.dry_type(o);
        var basic_type = _.basic_type(o);

        if(arguments.length !== 3 || !_.isArray(types) || !map_types){
            types = _.rest(arguments);
        }

        return(_.find(types, function(test_type){
            if(test_type === "*"){ return(true); }
            if(_.contains(_.basic_type.types, test_type) && test_type === basic_type){
                return(true);
            }else{ return(dry_type === test_type); }
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

    _.abs = function(n){ return(Math.abs(n)); }

    _.noop =  function(){};
    _.byteUnits = _.byte_units = function(val, fixed){

        var is_negative = (val < 0);
        if(is_negative){ val = _.abs(val); }

        var unit = "B";

        if(val >= 1024){
            val /= 1024;
            unit = "K"
        }
        if(val >= 1024){
            val /= 1024;
            unit = "M"
        }
        if(val >= 1024){
            val /= 1024;
            unit = "G"
        }
        if(val >= 1024){
            val /= 1024;
            unit = "T"
        }
        if(val >= 1024){
            val /= 1024;
            unit = "P"
        }

        if(is_negative){ val *= -1; }

        if(unit === "B"){ return(val + unit); }

        if(fixed !== undefined){
            return(_.format.number(val, { fixed: fixed }) + unit);
        }else{
            return(_.format.number(val, { max: 1 }) + unit);
        }
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

    _.get = function(obj, key, call_f){

        function get_val(v){
            if(!call_f){ return(v); }
            else if(_.isFunction(v)){ return(v()); }
            else{ return(v); }
        }

        if(obj[key] !== undefined){ return get_val(obj[key]); }

        for (var prop in obj){
            if(_.has(obj, prop) && prop.toLowerCase() === key.toLowerCase()){
                return get_val(obj[prop]);
            }
        }

        return undefined;
    };

    _.val = function(obj, key){
        return _.get(obj, key, true);
    };

    _.leaf = function(obj, key){
        if(!obj){ return(undefined); }
        if(obj[key] !== undefined){ return(obj[key]); }

        var key_split = key.split(".");
        while(key_split.length > 0){
            key = key_split.shift();
            if(obj[key]){ obj = obj[key]; }
            else{ return(undefined); }
        }
        return(obj);
    }


    _.define = _.def = function(obj, key, default_value){
        if(default_value === undefined){
            if(obj === undefined){ return(key); }
            if(obj !== undefined){ return(obj); }
        }
        if(obj[key] === undefined){
            obj[key] = default_value;
            return(obj[key]);
        }else{
            return(obj[key]);
        }
    };

    _.time = function(cat, key){ return _.timer.time(cat, key); };
    
    // an order of magnitued cheaper than _.times
    // effectively as cheap as a for loop
    _.f = _.for = function(times, f){
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
            f(_.extend(_.error("timeout", "Operation timed out.", { stack: stack }), err));
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

    _.lock = function(f, no_ui){
        var running = false;

        var lock = function(e){
            if(running){
                !no_ui && e && e.preventDefault && e.preventDefault();
                return;
            }else{
                running = true;
                var release = function(){ running = false; };
                release.before = function(f){ return(function(){ release(); var ret = f.apply(this, arguments); return(ret); }); };
                release.after = function(f){ return(function(){ var ret = f.apply(this, arguments); release(); return(ret); }); };
                return f.apply(this, _.concat(release, _.a(arguments)));
            }
        }
        return(lock);
    };
    _.lock.ui = _.removed("lock.ui");
    _.lock.async = _.removed("lock.async");

    _.addProperties = _.add_properties = function(o, propArray, val){
        _.each(propArray, function(prop){ o[prop] = val; });
        return(o);
    };
    _.walk = function(o, iterator, context){
        _.each(o, function(val, key, o){
            var follow_branch = iterator.call(context, val, key, o);
            if(follow_branch === false){ return; }
            if(val && (_.isObject(val) || _.isArray(val))){
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
            target = _.lc(target);
            return(_.any(col, function(a){ return(_.lc(a) === target); }));
        }else{
            return(_.any(col, function(a){ return(a === target); }));
        }
    };
    _.pad = function(str, n){
        if((n-str.length) > 0){
            return(str + Array(n-str.length).join(" "));
        }else{ return(str); }
    };
    _.remove = function(array, from, to){
        var rest = array.slice((to || from) + 1 || array.length);
        array.length = from < 0 ? array.length + from : from;
        return array.push.apply(array, rest);
    };
    _.unionize = function(){
        var args = arguments;
        return(function(){
            var self = this;
            var uargs = arguments;
            _.each(args, function(f){
                if(_.isFunction(f)){
                    f.apply(self, uargs);
                }
            });
        });
    };
    _.trim = function trim(str){
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

    _.lc = function(s){ return(s.toLowerCase()); };
    _.lct = _.compose(_.lc, _.trim);

    _.getter = function(hash_name, variable_name){
        if(hash_name !== undefined && variable_name !== undefined){
            return(function(){
                return(this[hash_name][variable_name]);
            });
        }else{
            return(function(){
                return(this[hash_name]);
            });
        }
    };

    _.getterKey = _.getter_key = function(hash_name, variable_name){

        if(hash_name !== undefined && variable_name !== undefined){
            return(function(key){
                if(key === undefined){ return(this[hash_name][variable_name]); }
                return(this[hash_name][variable_name][key]);
            });
        }else{
            return(function(key){
                if(key === undefined){ return(this[hash_name]); }
                else{ return(this[hash_name][key]); }
            });
        }
    };


    _.getterSetter = _.getter_setter = function(hash_name, variable_name){
        if(hash_name !== undefined && variable_name !== undefined){
            return(function(val){
                if(val === undefined){ return(this[hash_name][variable_name]); }
                else{
                    this[hash_name][variable_name] = val;
                    return(this);
                }
            });
        }else{
            return(function(val){
                if(val === undefined){ return(this[hash_name]); }
                else{
                    this[hash_name] = val;
                    return(this);
                }
            });
        }
    };

    _.getterSetterKey = _.getter_setter_key = function(hash_name, variable_name, locked){
        if(_.isBoolean(variable_name)){ locked = variable_name; variable_name = undefined; }
        if(hash_name !== undefined && variable_name !== undefined){
            return(function(key, val){
                if(key === undefined){ return(this[hash_name][variable_name]); }
                else{
                    if(val === undefined){
                        if(!locked && (_.isObject(key) || _.isArray(key))){
                            this[hash_name][variable_name] = key;
                            return(this);
                        }else{
                            return(this[hash_name][variable_name][key]);
                        }
                    }else{
                        this[hash_name][variable_name][key] = val;
                        return(this);
                    }
                }
            });
        }else{
            return(function(key, val){
                if(key === undefined){ return(this[hash_name]); }
                else{
                    if(val === undefined){
                        if(!locked && (_.isObject(key) || _.isArray(key))){
                            return(this[hash_name] = key);
                            return(this);
                        }else{
                            return(this[hash_name][key]);
                        }
                    }else{
                        this[hash_name][key] = val;
                        return(this);
                    }
                }
            });
        }
    };

    _.r = _.getter;
    _.rw = _.getter_setter;
    _.rk = _.getter_key;
    _.rwk = _.getter_setter_key;

    _.inherit = function(childConstructor, parentConstructor){
        childConstructor.prototype = Object.create(parentConstructor.prototype);
        childConstructor.prototype.constructor = childConstructor;
    };

    _.toNumber = _.to_number = function(n, rnd){
        if(_.is_string(n)){ n = _.trim(n); }
        else if(!_.is_number(n)){ return(null); }

        if(n === ""){ return(null); }
        if(rnd === true){ return(_.n(_.numbers(n))); }

        n = n - 0; 
        if(isNaN(n)){ return(null); }
        if(rnd !== undefined){ return(_.round(n, rnd)); }
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
    _.sorn = function(s){ 
        if(_.is_string(s) || _.is_number(s)){
            return(s + "");
        }else{
            return(null);
        }
    };

    _.str.pop = function(str, count){
        str = _.sorn(str);
        if(count === undefined){ count = 1; }
        if(str === null){ return(null); }
        return(str.substr(0, (str.length - count)));
    };

    _.decimals = function(num, count, fixed){
        num = _.n(num);
        if(num === null){ return(null); }
        fixed = (fixed !== false)

        num = num.toFixed(count);
        if(!fixed){
            num = num.replace(_.regex("0+$"), "");
            num = num.replace(_.regex("[.]$"), "");
        }
        return(num);
    }
 
    _.decimalCount = _.decimal_count = function (num) {
        num = _.n(num);
        if(num === null){ return(null); }
        var match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
        if (!match) { return 0; }
        return Math.max(
            0,
            // Number of digits right of decimal point.
            (match[1] ? match[1].length : 0)
            // Adjust for scientific notation.
            - (match[2] ? +match[2] : 0));
    }

    _.numbers = function(str_or_a){
        if(_.isNumber(str_or_a)){ return("" + str_or_a); }
        var numbers = _.filter(str_or_a, function(char){ return(_.to_number(char) !== null); });
        if(_.is_string(str_or_a) || str_or_a === undefined){
            return(numbers.join(""));
        }else{ return(numbers); }
    };

};

















