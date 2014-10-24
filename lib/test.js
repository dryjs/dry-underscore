
exports.mixin = function(_, ns){

    if(ns === undefined){ ns = {}; }

    var test = require('assert');

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
                return actual.getTime() === expected.getTime();

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

    test.eq = function(actual, expected){
        if(deepEqual(actual, expected, {strict: true})){
            return(true);
        }else{
            if(_.isString(actual) && _.isString(expected)){
                var err = new Error('"' + actual + '"' + " not eq " + '"' + expected + '"');
                err.actual = actual;
                err.expected = expected;
                throw(err);
            }else{
                var err = new Error(_.stringify(actual) + " not eq " + _.stringify(expected));
                err.actual = _.stringify(actual);
                err.expected = _.stringify(expected);
                throw(err);
            }
        }
    };

    test.ok = function(val){
        if(!val){
            var err = new Error("false not ok");
            err.actual = true;
            err.expected = false;
            throw(err);
        }
    };

    test.throws = function(f){
        var threw = false;

        try{ f(); }
        catch(e){ threw = true; }

        if(!threw){
            throw(_.exception("NoThrow", "Expected function to throw an error, it didn't."));
        }
    };

    ns.test = test;

    return(test);
}

