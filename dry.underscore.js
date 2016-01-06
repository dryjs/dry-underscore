(function(){
//     Underscore.js 1.7.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.7.0';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matches(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context);
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    if (obj == null) return obj;
    iteratee = optimizeCb(iteratee, context);
    var i, length = obj.length;
    if (!_.isFunction(obj) && length === +length) {
      for (i = 0; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    if (obj == null) return [];
    iteratee = cb(iteratee, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length),
        currentKey;
    for (var index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = optimizeCb(iteratee, context, 4);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index = 0, currentKey;
    if (arguments.length < 3) {
      if (!length) throw new TypeError(reduceError);
      memo = obj[keys ? keys[index++] : index++];
    }
    for (; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = optimizeCb(iteratee, context, 4);
    var keys = obj.length !== + obj.length && _.keys(obj),
        index = (keys || obj).length,
        currentKey;
    if (arguments.length < 3) {
      if (!index) throw new TypeError(reduceError);
      memo = obj[keys ? keys[--index] : --index];
    }
    while (index--) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    predicate = cb(predicate, context);
    _.some(obj, function(value, index, list) {
      if (predicate(value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    if (obj == null) return true;
    predicate = cb(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    if (obj == null) return false;
    predicate = cb(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (obj.length !== +obj.length) obj = _.values(obj);
    return _.indexOf(obj, target) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = obj && obj.length === +obj.length ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = low + high >>> 1;
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return obj.length === +obj.length ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0, value;
    for (var i = startIndex || 0, length = input && input.length; i < length; i++) {
      value = input[i];
      if (value && value.length >= 0 && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (array == null) return [];
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = array.length; i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    if (array == null) return [];
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = array.length; i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function(array) {
    if (array == null) return [];
    var length = _.max(arguments, 'length').length;
    var results = Array(length);
    while (length-- > 0) {
      results[length] = _.pluck(arguments, length);
    }
    return results;
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    return _.zip.apply(null, array);
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    var i = 0, length = array && array.length;
    if (typeof isSorted == 'number') {
      i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
    } else if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  _.lastIndexOf = function(array, item, from) {
    var idx = array ? array.length : 0;
    if (typeof from == 'number') {
      idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
    }
    while (--idx >= 0) if (array[idx] === item) return idx;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var Ctor = function(){};

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    Ctor.prototype = sourceFunc.prototype;
    var self = new Ctor;
    Ctor.prototype = null;
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    return function bound() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function bound() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed before being called N times.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) {
        func = null;
      }
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !({toString: null}).propertyIsEnumerable('toString');
  var nonEnumerableProps = ['constructor', 'valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj) && !_.isArray(obj) && !_.isFunction(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);

    // Ahem, IE < 9.
    if (hasEnumBug) {
      var nonEnumIdx = nonEnumerableProps.length;
      while (nonEnumIdx--) {
        var prop = nonEnumerableProps[nonEnumIdx];
        if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);
      }
    }
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    if (!_.isObject(obj)) return obj;
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];
      for (prop in source) {
        obj[prop] = source[prop];
      }
    }
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj, iteratee, context) {
    var result = {}, key;
    if (obj == null) return result;
    if (_.isFunction(iteratee)) {
      iteratee = optimizeCb(iteratee, context);
      for (key in obj) {
        var value = obj[key];
        if (iteratee(value, key, obj)) result[key] = value;
      }
    } else {
      var keys = flatten(arguments, false, false, 1);
      obj = new Object(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        key = keys[i];
        if (key in obj) result[key] = obj[key];
      }
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    if (!_.isObject(obj)) return obj;
    for (var i = 1, length = arguments.length; i < length; i++) {
      var source = arguments[i];
      for (var prop in source) {
        if (obj[prop] === void 0) obj[prop] = source[prop];
      }
    }
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size, result;
    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size === b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      size = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      result = _.keys(b).length === size;
      if (result) {
        while (size--) {
          // Deep compare each member
          key = keys[size];
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  _.isFunction = function(obj){
    return toString.call(obj) === '[object Function]';
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around an IE 11 bug.
  if (typeof /./ !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    var pairs = _.pairs(attrs), length = pairs.length;
    return function(obj) {
      if (obj == null) return !length;
      obj = new Object(obj);
      for (var i = 0; i < length; i++) {
        var pair = pairs[i], key = pair[0];
        if (pair[1] !== obj[key] || !(key in obj)) return false;
      }
      return true;
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));
//! moment.js
//! version : 2.10.6
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
!function(a,b){"object"==typeof exports&&"undefined"!=typeof module?module.exports=b():"function"==typeof define&&define.amd?define(b):a.moment=b()}(this,function(){"use strict";function a(){return Hc.apply(null,arguments)}function b(a){Hc=a}function c(a){return"[object Array]"===Object.prototype.toString.call(a)}function d(a){return a instanceof Date||"[object Date]"===Object.prototype.toString.call(a)}function e(a,b){var c,d=[];for(c=0;c<a.length;++c)d.push(b(a[c],c));return d}function f(a,b){return Object.prototype.hasOwnProperty.call(a,b)}function g(a,b){for(var c in b)f(b,c)&&(a[c]=b[c]);return f(b,"toString")&&(a.toString=b.toString),f(b,"valueOf")&&(a.valueOf=b.valueOf),a}function h(a,b,c,d){return Ca(a,b,c,d,!0).utc()}function i(){return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1}}function j(a){return null==a._pf&&(a._pf=i()),a._pf}function k(a){if(null==a._isValid){var b=j(a);a._isValid=!(isNaN(a._d.getTime())||!(b.overflow<0)||b.empty||b.invalidMonth||b.invalidWeekday||b.nullInput||b.invalidFormat||b.userInvalidated),a._strict&&(a._isValid=a._isValid&&0===b.charsLeftOver&&0===b.unusedTokens.length&&void 0===b.bigHour)}return a._isValid}function l(a){var b=h(NaN);return null!=a?g(j(b),a):j(b).userInvalidated=!0,b}function m(a,b){var c,d,e;if("undefined"!=typeof b._isAMomentObject&&(a._isAMomentObject=b._isAMomentObject),"undefined"!=typeof b._i&&(a._i=b._i),"undefined"!=typeof b._f&&(a._f=b._f),"undefined"!=typeof b._l&&(a._l=b._l),"undefined"!=typeof b._strict&&(a._strict=b._strict),"undefined"!=typeof b._tzm&&(a._tzm=b._tzm),"undefined"!=typeof b._isUTC&&(a._isUTC=b._isUTC),"undefined"!=typeof b._offset&&(a._offset=b._offset),"undefined"!=typeof b._pf&&(a._pf=j(b)),"undefined"!=typeof b._locale&&(a._locale=b._locale),Jc.length>0)for(c in Jc)d=Jc[c],e=b[d],"undefined"!=typeof e&&(a[d]=e);return a}function n(b){m(this,b),this._d=new Date(null!=b._d?b._d.getTime():NaN),Kc===!1&&(Kc=!0,a.updateOffset(this),Kc=!1)}function o(a){return a instanceof n||null!=a&&null!=a._isAMomentObject}function p(a){return 0>a?Math.ceil(a):Math.floor(a)}function q(a){var b=+a,c=0;return 0!==b&&isFinite(b)&&(c=p(b)),c}function r(a,b,c){var d,e=Math.min(a.length,b.length),f=Math.abs(a.length-b.length),g=0;for(d=0;e>d;d++)(c&&a[d]!==b[d]||!c&&q(a[d])!==q(b[d]))&&g++;return g+f}function s(){}function t(a){return a?a.toLowerCase().replace("_","-"):a}function u(a){for(var b,c,d,e,f=0;f<a.length;){for(e=t(a[f]).split("-"),b=e.length,c=t(a[f+1]),c=c?c.split("-"):null;b>0;){if(d=v(e.slice(0,b).join("-")))return d;if(c&&c.length>=b&&r(e,c,!0)>=b-1)break;b--}f++}return null}function v(a){var b=null;if(!Lc[a]&&"undefined"!=typeof module&&module&&module.exports)try{b=Ic._abbr,require("./locale/"+a),w(b)}catch(c){}return Lc[a]}function w(a,b){var c;return a&&(c="undefined"==typeof b?y(a):x(a,b),c&&(Ic=c)),Ic._abbr}function x(a,b){return null!==b?(b.abbr=a,Lc[a]=Lc[a]||new s,Lc[a].set(b),w(a),Lc[a]):(delete Lc[a],null)}function y(a){var b;if(a&&a._locale&&a._locale._abbr&&(a=a._locale._abbr),!a)return Ic;if(!c(a)){if(b=v(a))return b;a=[a]}return u(a)}function z(a,b){var c=a.toLowerCase();Mc[c]=Mc[c+"s"]=Mc[b]=a}function A(a){return"string"==typeof a?Mc[a]||Mc[a.toLowerCase()]:void 0}function B(a){var b,c,d={};for(c in a)f(a,c)&&(b=A(c),b&&(d[b]=a[c]));return d}function C(b,c){return function(d){return null!=d?(E(this,b,d),a.updateOffset(this,c),this):D(this,b)}}function D(a,b){return a._d["get"+(a._isUTC?"UTC":"")+b]()}function E(a,b,c){return a._d["set"+(a._isUTC?"UTC":"")+b](c)}function F(a,b){var c;if("object"==typeof a)for(c in a)this.set(c,a[c]);else if(a=A(a),"function"==typeof this[a])return this[a](b);return this}function G(a,b,c){var d=""+Math.abs(a),e=b-d.length,f=a>=0;return(f?c?"+":"":"-")+Math.pow(10,Math.max(0,e)).toString().substr(1)+d}function H(a,b,c,d){var e=d;"string"==typeof d&&(e=function(){return this[d]()}),a&&(Qc[a]=e),b&&(Qc[b[0]]=function(){return G(e.apply(this,arguments),b[1],b[2])}),c&&(Qc[c]=function(){return this.localeData().ordinal(e.apply(this,arguments),a)})}function I(a){return a.match(/\[[\s\S]/)?a.replace(/^\[|\]$/g,""):a.replace(/\\/g,"")}function J(a){var b,c,d=a.match(Nc);for(b=0,c=d.length;c>b;b++)Qc[d[b]]?d[b]=Qc[d[b]]:d[b]=I(d[b]);return function(e){var f="";for(b=0;c>b;b++)f+=d[b]instanceof Function?d[b].call(e,a):d[b];return f}}function K(a,b){return a.isValid()?(b=L(b,a.localeData()),Pc[b]=Pc[b]||J(b),Pc[b](a)):a.localeData().invalidDate()}function L(a,b){function c(a){return b.longDateFormat(a)||a}var d=5;for(Oc.lastIndex=0;d>=0&&Oc.test(a);)a=a.replace(Oc,c),Oc.lastIndex=0,d-=1;return a}function M(a){return"function"==typeof a&&"[object Function]"===Object.prototype.toString.call(a)}function N(a,b,c){dd[a]=M(b)?b:function(a){return a&&c?c:b}}function O(a,b){return f(dd,a)?dd[a](b._strict,b._locale):new RegExp(P(a))}function P(a){return a.replace("\\","").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(a,b,c,d,e){return b||c||d||e}).replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function Q(a,b){var c,d=b;for("string"==typeof a&&(a=[a]),"number"==typeof b&&(d=function(a,c){c[b]=q(a)}),c=0;c<a.length;c++)ed[a[c]]=d}function R(a,b){Q(a,function(a,c,d,e){d._w=d._w||{},b(a,d._w,d,e)})}function S(a,b,c){null!=b&&f(ed,a)&&ed[a](b,c._a,c,a)}function T(a,b){return new Date(Date.UTC(a,b+1,0)).getUTCDate()}function U(a){return this._months[a.month()]}function V(a){return this._monthsShort[a.month()]}function W(a,b,c){var d,e,f;for(this._monthsParse||(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[]),d=0;12>d;d++){if(e=h([2e3,d]),c&&!this._longMonthsParse[d]&&(this._longMonthsParse[d]=new RegExp("^"+this.months(e,"").replace(".","")+"$","i"),this._shortMonthsParse[d]=new RegExp("^"+this.monthsShort(e,"").replace(".","")+"$","i")),c||this._monthsParse[d]||(f="^"+this.months(e,"")+"|^"+this.monthsShort(e,""),this._monthsParse[d]=new RegExp(f.replace(".",""),"i")),c&&"MMMM"===b&&this._longMonthsParse[d].test(a))return d;if(c&&"MMM"===b&&this._shortMonthsParse[d].test(a))return d;if(!c&&this._monthsParse[d].test(a))return d}}function X(a,b){var c;return"string"==typeof b&&(b=a.localeData().monthsParse(b),"number"!=typeof b)?a:(c=Math.min(a.date(),T(a.year(),b)),a._d["set"+(a._isUTC?"UTC":"")+"Month"](b,c),a)}function Y(b){return null!=b?(X(this,b),a.updateOffset(this,!0),this):D(this,"Month")}function Z(){return T(this.year(),this.month())}function $(a){var b,c=a._a;return c&&-2===j(a).overflow&&(b=c[gd]<0||c[gd]>11?gd:c[hd]<1||c[hd]>T(c[fd],c[gd])?hd:c[id]<0||c[id]>24||24===c[id]&&(0!==c[jd]||0!==c[kd]||0!==c[ld])?id:c[jd]<0||c[jd]>59?jd:c[kd]<0||c[kd]>59?kd:c[ld]<0||c[ld]>999?ld:-1,j(a)._overflowDayOfYear&&(fd>b||b>hd)&&(b=hd),j(a).overflow=b),a}function _(b){a.suppressDeprecationWarnings===!1&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+b)}function aa(a,b){var c=!0;return g(function(){return c&&(_(a+"\n"+(new Error).stack),c=!1),b.apply(this,arguments)},b)}function ba(a,b){od[a]||(_(b),od[a]=!0)}function ca(a){var b,c,d=a._i,e=pd.exec(d);if(e){for(j(a).iso=!0,b=0,c=qd.length;c>b;b++)if(qd[b][1].exec(d)){a._f=qd[b][0];break}for(b=0,c=rd.length;c>b;b++)if(rd[b][1].exec(d)){a._f+=(e[6]||" ")+rd[b][0];break}d.match(ad)&&(a._f+="Z"),va(a)}else a._isValid=!1}function da(b){var c=sd.exec(b._i);return null!==c?void(b._d=new Date(+c[1])):(ca(b),void(b._isValid===!1&&(delete b._isValid,a.createFromInputFallback(b))))}function ea(a,b,c,d,e,f,g){var h=new Date(a,b,c,d,e,f,g);return 1970>a&&h.setFullYear(a),h}function fa(a){var b=new Date(Date.UTC.apply(null,arguments));return 1970>a&&b.setUTCFullYear(a),b}function ga(a){return ha(a)?366:365}function ha(a){return a%4===0&&a%100!==0||a%400===0}function ia(){return ha(this.year())}function ja(a,b,c){var d,e=c-b,f=c-a.day();return f>e&&(f-=7),e-7>f&&(f+=7),d=Da(a).add(f,"d"),{week:Math.ceil(d.dayOfYear()/7),year:d.year()}}function ka(a){return ja(a,this._week.dow,this._week.doy).week}function la(){return this._week.dow}function ma(){return this._week.doy}function na(a){var b=this.localeData().week(this);return null==a?b:this.add(7*(a-b),"d")}function oa(a){var b=ja(this,1,4).week;return null==a?b:this.add(7*(a-b),"d")}function pa(a,b,c,d,e){var f,g=6+e-d,h=fa(a,0,1+g),i=h.getUTCDay();return e>i&&(i+=7),c=null!=c?1*c:e,f=1+g+7*(b-1)-i+c,{year:f>0?a:a-1,dayOfYear:f>0?f:ga(a-1)+f}}function qa(a){var b=Math.round((this.clone().startOf("day")-this.clone().startOf("year"))/864e5)+1;return null==a?b:this.add(a-b,"d")}function ra(a,b,c){return null!=a?a:null!=b?b:c}function sa(a){var b=new Date;return a._useUTC?[b.getUTCFullYear(),b.getUTCMonth(),b.getUTCDate()]:[b.getFullYear(),b.getMonth(),b.getDate()]}function ta(a){var b,c,d,e,f=[];if(!a._d){for(d=sa(a),a._w&&null==a._a[hd]&&null==a._a[gd]&&ua(a),a._dayOfYear&&(e=ra(a._a[fd],d[fd]),a._dayOfYear>ga(e)&&(j(a)._overflowDayOfYear=!0),c=fa(e,0,a._dayOfYear),a._a[gd]=c.getUTCMonth(),a._a[hd]=c.getUTCDate()),b=0;3>b&&null==a._a[b];++b)a._a[b]=f[b]=d[b];for(;7>b;b++)a._a[b]=f[b]=null==a._a[b]?2===b?1:0:a._a[b];24===a._a[id]&&0===a._a[jd]&&0===a._a[kd]&&0===a._a[ld]&&(a._nextDay=!0,a._a[id]=0),a._d=(a._useUTC?fa:ea).apply(null,f),null!=a._tzm&&a._d.setUTCMinutes(a._d.getUTCMinutes()-a._tzm),a._nextDay&&(a._a[id]=24)}}function ua(a){var b,c,d,e,f,g,h;b=a._w,null!=b.GG||null!=b.W||null!=b.E?(f=1,g=4,c=ra(b.GG,a._a[fd],ja(Da(),1,4).year),d=ra(b.W,1),e=ra(b.E,1)):(f=a._locale._week.dow,g=a._locale._week.doy,c=ra(b.gg,a._a[fd],ja(Da(),f,g).year),d=ra(b.w,1),null!=b.d?(e=b.d,f>e&&++d):e=null!=b.e?b.e+f:f),h=pa(c,d,e,g,f),a._a[fd]=h.year,a._dayOfYear=h.dayOfYear}function va(b){if(b._f===a.ISO_8601)return void ca(b);b._a=[],j(b).empty=!0;var c,d,e,f,g,h=""+b._i,i=h.length,k=0;for(e=L(b._f,b._locale).match(Nc)||[],c=0;c<e.length;c++)f=e[c],d=(h.match(O(f,b))||[])[0],d&&(g=h.substr(0,h.indexOf(d)),g.length>0&&j(b).unusedInput.push(g),h=h.slice(h.indexOf(d)+d.length),k+=d.length),Qc[f]?(d?j(b).empty=!1:j(b).unusedTokens.push(f),S(f,d,b)):b._strict&&!d&&j(b).unusedTokens.push(f);j(b).charsLeftOver=i-k,h.length>0&&j(b).unusedInput.push(h),j(b).bigHour===!0&&b._a[id]<=12&&b._a[id]>0&&(j(b).bigHour=void 0),b._a[id]=wa(b._locale,b._a[id],b._meridiem),ta(b),$(b)}function wa(a,b,c){var d;return null==c?b:null!=a.meridiemHour?a.meridiemHour(b,c):null!=a.isPM?(d=a.isPM(c),d&&12>b&&(b+=12),d||12!==b||(b=0),b):b}function xa(a){var b,c,d,e,f;if(0===a._f.length)return j(a).invalidFormat=!0,void(a._d=new Date(NaN));for(e=0;e<a._f.length;e++)f=0,b=m({},a),null!=a._useUTC&&(b._useUTC=a._useUTC),b._f=a._f[e],va(b),k(b)&&(f+=j(b).charsLeftOver,f+=10*j(b).unusedTokens.length,j(b).score=f,(null==d||d>f)&&(d=f,c=b));g(a,c||b)}function ya(a){if(!a._d){var b=B(a._i);a._a=[b.year,b.month,b.day||b.date,b.hour,b.minute,b.second,b.millisecond],ta(a)}}function za(a){var b=new n($(Aa(a)));return b._nextDay&&(b.add(1,"d"),b._nextDay=void 0),b}function Aa(a){var b=a._i,e=a._f;return a._locale=a._locale||y(a._l),null===b||void 0===e&&""===b?l({nullInput:!0}):("string"==typeof b&&(a._i=b=a._locale.preparse(b)),o(b)?new n($(b)):(c(e)?xa(a):e?va(a):d(b)?a._d=b:Ba(a),a))}function Ba(b){var f=b._i;void 0===f?b._d=new Date:d(f)?b._d=new Date(+f):"string"==typeof f?da(b):c(f)?(b._a=e(f.slice(0),function(a){return parseInt(a,10)}),ta(b)):"object"==typeof f?ya(b):"number"==typeof f?b._d=new Date(f):a.createFromInputFallback(b)}function Ca(a,b,c,d,e){var f={};return"boolean"==typeof c&&(d=c,c=void 0),f._isAMomentObject=!0,f._useUTC=f._isUTC=e,f._l=c,f._i=a,f._f=b,f._strict=d,za(f)}function Da(a,b,c,d){return Ca(a,b,c,d,!1)}function Ea(a,b){var d,e;if(1===b.length&&c(b[0])&&(b=b[0]),!b.length)return Da();for(d=b[0],e=1;e<b.length;++e)(!b[e].isValid()||b[e][a](d))&&(d=b[e]);return d}function Fa(){var a=[].slice.call(arguments,0);return Ea("isBefore",a)}function Ga(){var a=[].slice.call(arguments,0);return Ea("isAfter",a)}function Ha(a){var b=B(a),c=b.year||0,d=b.quarter||0,e=b.month||0,f=b.week||0,g=b.day||0,h=b.hour||0,i=b.minute||0,j=b.second||0,k=b.millisecond||0;this._milliseconds=+k+1e3*j+6e4*i+36e5*h,this._days=+g+7*f,this._months=+e+3*d+12*c,this._data={},this._locale=y(),this._bubble()}function Ia(a){return a instanceof Ha}function Ja(a,b){H(a,0,0,function(){var a=this.utcOffset(),c="+";return 0>a&&(a=-a,c="-"),c+G(~~(a/60),2)+b+G(~~a%60,2)})}function Ka(a){var b=(a||"").match(ad)||[],c=b[b.length-1]||[],d=(c+"").match(xd)||["-",0,0],e=+(60*d[1])+q(d[2]);return"+"===d[0]?e:-e}function La(b,c){var e,f;return c._isUTC?(e=c.clone(),f=(o(b)||d(b)?+b:+Da(b))-+e,e._d.setTime(+e._d+f),a.updateOffset(e,!1),e):Da(b).local()}function Ma(a){return 15*-Math.round(a._d.getTimezoneOffset()/15)}function Na(b,c){var d,e=this._offset||0;return null!=b?("string"==typeof b&&(b=Ka(b)),Math.abs(b)<16&&(b=60*b),!this._isUTC&&c&&(d=Ma(this)),this._offset=b,this._isUTC=!0,null!=d&&this.add(d,"m"),e!==b&&(!c||this._changeInProgress?bb(this,Ya(b-e,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,a.updateOffset(this,!0),this._changeInProgress=null)),this):this._isUTC?e:Ma(this)}function Oa(a,b){return null!=a?("string"!=typeof a&&(a=-a),this.utcOffset(a,b),this):-this.utcOffset()}function Pa(a){return this.utcOffset(0,a)}function Qa(a){return this._isUTC&&(this.utcOffset(0,a),this._isUTC=!1,a&&this.subtract(Ma(this),"m")),this}function Ra(){return this._tzm?this.utcOffset(this._tzm):"string"==typeof this._i&&this.utcOffset(Ka(this._i)),this}function Sa(a){return a=a?Da(a).utcOffset():0,(this.utcOffset()-a)%60===0}function Ta(){return this.utcOffset()>this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset()}function Ua(){if("undefined"!=typeof this._isDSTShifted)return this._isDSTShifted;var a={};if(m(a,this),a=Aa(a),a._a){var b=a._isUTC?h(a._a):Da(a._a);this._isDSTShifted=this.isValid()&&r(a._a,b.toArray())>0}else this._isDSTShifted=!1;return this._isDSTShifted}function Va(){return!this._isUTC}function Wa(){return this._isUTC}function Xa(){return this._isUTC&&0===this._offset}function Ya(a,b){var c,d,e,g=a,h=null;return Ia(a)?g={ms:a._milliseconds,d:a._days,M:a._months}:"number"==typeof a?(g={},b?g[b]=a:g.milliseconds=a):(h=yd.exec(a))?(c="-"===h[1]?-1:1,g={y:0,d:q(h[hd])*c,h:q(h[id])*c,m:q(h[jd])*c,s:q(h[kd])*c,ms:q(h[ld])*c}):(h=zd.exec(a))?(c="-"===h[1]?-1:1,g={y:Za(h[2],c),M:Za(h[3],c),d:Za(h[4],c),h:Za(h[5],c),m:Za(h[6],c),s:Za(h[7],c),w:Za(h[8],c)}):null==g?g={}:"object"==typeof g&&("from"in g||"to"in g)&&(e=_a(Da(g.from),Da(g.to)),g={},g.ms=e.milliseconds,g.M=e.months),d=new Ha(g),Ia(a)&&f(a,"_locale")&&(d._locale=a._locale),d}function Za(a,b){var c=a&&parseFloat(a.replace(",","."));return(isNaN(c)?0:c)*b}function $a(a,b){var c={milliseconds:0,months:0};return c.months=b.month()-a.month()+12*(b.year()-a.year()),a.clone().add(c.months,"M").isAfter(b)&&--c.months,c.milliseconds=+b-+a.clone().add(c.months,"M"),c}function _a(a,b){var c;return b=La(b,a),a.isBefore(b)?c=$a(a,b):(c=$a(b,a),c.milliseconds=-c.milliseconds,c.months=-c.months),c}function ab(a,b){return function(c,d){var e,f;return null===d||isNaN(+d)||(ba(b,"moment()."+b+"(period, number) is deprecated. Please use moment()."+b+"(number, period)."),f=c,c=d,d=f),c="string"==typeof c?+c:c,e=Ya(c,d),bb(this,e,a),this}}function bb(b,c,d,e){var f=c._milliseconds,g=c._days,h=c._months;e=null==e?!0:e,f&&b._d.setTime(+b._d+f*d),g&&E(b,"Date",D(b,"Date")+g*d),h&&X(b,D(b,"Month")+h*d),e&&a.updateOffset(b,g||h)}function cb(a,b){var c=a||Da(),d=La(c,this).startOf("day"),e=this.diff(d,"days",!0),f=-6>e?"sameElse":-1>e?"lastWeek":0>e?"lastDay":1>e?"sameDay":2>e?"nextDay":7>e?"nextWeek":"sameElse";return this.format(b&&b[f]||this.localeData().calendar(f,this,Da(c)))}function db(){return new n(this)}function eb(a,b){var c;return b=A("undefined"!=typeof b?b:"millisecond"),"millisecond"===b?(a=o(a)?a:Da(a),+this>+a):(c=o(a)?+a:+Da(a),c<+this.clone().startOf(b))}function fb(a,b){var c;return b=A("undefined"!=typeof b?b:"millisecond"),"millisecond"===b?(a=o(a)?a:Da(a),+a>+this):(c=o(a)?+a:+Da(a),+this.clone().endOf(b)<c)}function gb(a,b,c){return this.isAfter(a,c)&&this.isBefore(b,c)}function hb(a,b){var c;return b=A(b||"millisecond"),"millisecond"===b?(a=o(a)?a:Da(a),+this===+a):(c=+Da(a),+this.clone().startOf(b)<=c&&c<=+this.clone().endOf(b))}function ib(a,b,c){var d,e,f=La(a,this),g=6e4*(f.utcOffset()-this.utcOffset());return b=A(b),"year"===b||"month"===b||"quarter"===b?(e=jb(this,f),"quarter"===b?e/=3:"year"===b&&(e/=12)):(d=this-f,e="second"===b?d/1e3:"minute"===b?d/6e4:"hour"===b?d/36e5:"day"===b?(d-g)/864e5:"week"===b?(d-g)/6048e5:d),c?e:p(e)}function jb(a,b){var c,d,e=12*(b.year()-a.year())+(b.month()-a.month()),f=a.clone().add(e,"months");return 0>b-f?(c=a.clone().add(e-1,"months"),d=(b-f)/(f-c)):(c=a.clone().add(e+1,"months"),d=(b-f)/(c-f)),-(e+d)}function kb(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")}function lb(){var a=this.clone().utc();return 0<a.year()&&a.year()<=9999?"function"==typeof Date.prototype.toISOString?this.toDate().toISOString():K(a,"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]"):K(a,"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]")}function mb(b){var c=K(this,b||a.defaultFormat);return this.localeData().postformat(c)}function nb(a,b){return this.isValid()?Ya({to:this,from:a}).locale(this.locale()).humanize(!b):this.localeData().invalidDate()}function ob(a){return this.from(Da(),a)}function pb(a,b){return this.isValid()?Ya({from:this,to:a}).locale(this.locale()).humanize(!b):this.localeData().invalidDate()}function qb(a){return this.to(Da(),a)}function rb(a){var b;return void 0===a?this._locale._abbr:(b=y(a),null!=b&&(this._locale=b),this)}function sb(){return this._locale}function tb(a){switch(a=A(a)){case"year":this.month(0);case"quarter":case"month":this.date(1);case"week":case"isoWeek":case"day":this.hours(0);case"hour":this.minutes(0);case"minute":this.seconds(0);case"second":this.milliseconds(0)}return"week"===a&&this.weekday(0),"isoWeek"===a&&this.isoWeekday(1),"quarter"===a&&this.month(3*Math.floor(this.month()/3)),this}function ub(a){return a=A(a),void 0===a||"millisecond"===a?this:this.startOf(a).add(1,"isoWeek"===a?"week":a).subtract(1,"ms")}function vb(){return+this._d-6e4*(this._offset||0)}function wb(){return Math.floor(+this/1e3)}function xb(){return this._offset?new Date(+this):this._d}function yb(){var a=this;return[a.year(),a.month(),a.date(),a.hour(),a.minute(),a.second(),a.millisecond()]}function zb(){var a=this;return{years:a.year(),months:a.month(),date:a.date(),hours:a.hours(),minutes:a.minutes(),seconds:a.seconds(),milliseconds:a.milliseconds()}}function Ab(){return k(this)}function Bb(){return g({},j(this))}function Cb(){return j(this).overflow}function Db(a,b){H(0,[a,a.length],0,b)}function Eb(a,b,c){return ja(Da([a,11,31+b-c]),b,c).week}function Fb(a){var b=ja(this,this.localeData()._week.dow,this.localeData()._week.doy).year;return null==a?b:this.add(a-b,"y")}function Gb(a){var b=ja(this,1,4).year;return null==a?b:this.add(a-b,"y")}function Hb(){return Eb(this.year(),1,4)}function Ib(){var a=this.localeData()._week;return Eb(this.year(),a.dow,a.doy)}function Jb(a){return null==a?Math.ceil((this.month()+1)/3):this.month(3*(a-1)+this.month()%3)}function Kb(a,b){return"string"!=typeof a?a:isNaN(a)?(a=b.weekdaysParse(a),"number"==typeof a?a:null):parseInt(a,10)}function Lb(a){return this._weekdays[a.day()]}function Mb(a){return this._weekdaysShort[a.day()]}function Nb(a){return this._weekdaysMin[a.day()]}function Ob(a){var b,c,d;for(this._weekdaysParse=this._weekdaysParse||[],b=0;7>b;b++)if(this._weekdaysParse[b]||(c=Da([2e3,1]).day(b),d="^"+this.weekdays(c,"")+"|^"+this.weekdaysShort(c,"")+"|^"+this.weekdaysMin(c,""),this._weekdaysParse[b]=new RegExp(d.replace(".",""),"i")),this._weekdaysParse[b].test(a))return b}function Pb(a){var b=this._isUTC?this._d.getUTCDay():this._d.getDay();return null!=a?(a=Kb(a,this.localeData()),this.add(a-b,"d")):b}function Qb(a){var b=(this.day()+7-this.localeData()._week.dow)%7;return null==a?b:this.add(a-b,"d")}function Rb(a){return null==a?this.day()||7:this.day(this.day()%7?a:a-7)}function Sb(a,b){H(a,0,0,function(){return this.localeData().meridiem(this.hours(),this.minutes(),b)})}function Tb(a,b){return b._meridiemParse}function Ub(a){return"p"===(a+"").toLowerCase().charAt(0)}function Vb(a,b,c){return a>11?c?"pm":"PM":c?"am":"AM"}function Wb(a,b){b[ld]=q(1e3*("0."+a))}function Xb(){return this._isUTC?"UTC":""}function Yb(){return this._isUTC?"Coordinated Universal Time":""}function Zb(a){return Da(1e3*a)}function $b(){return Da.apply(null,arguments).parseZone()}function _b(a,b,c){var d=this._calendar[a];return"function"==typeof d?d.call(b,c):d}function ac(a){var b=this._longDateFormat[a],c=this._longDateFormat[a.toUpperCase()];return b||!c?b:(this._longDateFormat[a]=c.replace(/MMMM|MM|DD|dddd/g,function(a){return a.slice(1)}),this._longDateFormat[a])}function bc(){return this._invalidDate}function cc(a){return this._ordinal.replace("%d",a)}function dc(a){return a}function ec(a,b,c,d){var e=this._relativeTime[c];return"function"==typeof e?e(a,b,c,d):e.replace(/%d/i,a)}function fc(a,b){var c=this._relativeTime[a>0?"future":"past"];return"function"==typeof c?c(b):c.replace(/%s/i,b)}function gc(a){var b,c;for(c in a)b=a[c],"function"==typeof b?this[c]=b:this["_"+c]=b;this._ordinalParseLenient=new RegExp(this._ordinalParse.source+"|"+/\d{1,2}/.source)}function hc(a,b,c,d){var e=y(),f=h().set(d,b);return e[c](f,a)}function ic(a,b,c,d,e){if("number"==typeof a&&(b=a,a=void 0),a=a||"",null!=b)return hc(a,b,c,e);var f,g=[];for(f=0;d>f;f++)g[f]=hc(a,f,c,e);return g}function jc(a,b){return ic(a,b,"months",12,"month")}function kc(a,b){return ic(a,b,"monthsShort",12,"month")}function lc(a,b){return ic(a,b,"weekdays",7,"day")}function mc(a,b){return ic(a,b,"weekdaysShort",7,"day")}function nc(a,b){return ic(a,b,"weekdaysMin",7,"day")}function oc(){var a=this._data;return this._milliseconds=Wd(this._milliseconds),this._days=Wd(this._days),this._months=Wd(this._months),a.milliseconds=Wd(a.milliseconds),a.seconds=Wd(a.seconds),a.minutes=Wd(a.minutes),a.hours=Wd(a.hours),a.months=Wd(a.months),a.years=Wd(a.years),this}function pc(a,b,c,d){var e=Ya(b,c);return a._milliseconds+=d*e._milliseconds,a._days+=d*e._days,a._months+=d*e._months,a._bubble()}function qc(a,b){return pc(this,a,b,1)}function rc(a,b){return pc(this,a,b,-1)}function sc(a){return 0>a?Math.floor(a):Math.ceil(a)}function tc(){var a,b,c,d,e,f=this._milliseconds,g=this._days,h=this._months,i=this._data;return f>=0&&g>=0&&h>=0||0>=f&&0>=g&&0>=h||(f+=864e5*sc(vc(h)+g),g=0,h=0),i.milliseconds=f%1e3,a=p(f/1e3),i.seconds=a%60,b=p(a/60),i.minutes=b%60,c=p(b/60),i.hours=c%24,g+=p(c/24),e=p(uc(g)),h+=e,g-=sc(vc(e)),d=p(h/12),h%=12,i.days=g,i.months=h,i.years=d,this}function uc(a){return 4800*a/146097}function vc(a){return 146097*a/4800}function wc(a){var b,c,d=this._milliseconds;if(a=A(a),"month"===a||"year"===a)return b=this._days+d/864e5,c=this._months+uc(b),"month"===a?c:c/12;switch(b=this._days+Math.round(vc(this._months)),a){case"week":return b/7+d/6048e5;case"day":return b+d/864e5;case"hour":return 24*b+d/36e5;case"minute":return 1440*b+d/6e4;case"second":return 86400*b+d/1e3;case"millisecond":return Math.floor(864e5*b)+d;default:throw new Error("Unknown unit "+a)}}function xc(){return this._milliseconds+864e5*this._days+this._months%12*2592e6+31536e6*q(this._months/12)}function yc(a){return function(){return this.as(a)}}function zc(a){return a=A(a),this[a+"s"]()}function Ac(a){return function(){return this._data[a]}}function Bc(){return p(this.days()/7)}function Cc(a,b,c,d,e){return e.relativeTime(b||1,!!c,a,d)}function Dc(a,b,c){var d=Ya(a).abs(),e=ke(d.as("s")),f=ke(d.as("m")),g=ke(d.as("h")),h=ke(d.as("d")),i=ke(d.as("M")),j=ke(d.as("y")),k=e<le.s&&["s",e]||1===f&&["m"]||f<le.m&&["mm",f]||1===g&&["h"]||g<le.h&&["hh",g]||1===h&&["d"]||h<le.d&&["dd",h]||1===i&&["M"]||i<le.M&&["MM",i]||1===j&&["y"]||["yy",j];return k[2]=b,k[3]=+a>0,k[4]=c,Cc.apply(null,k)}function Ec(a,b){return void 0===le[a]?!1:void 0===b?le[a]:(le[a]=b,!0)}function Fc(a){var b=this.localeData(),c=Dc(this,!a,b);return a&&(c=b.pastFuture(+this,c)),b.postformat(c)}function Gc(){var a,b,c,d=me(this._milliseconds)/1e3,e=me(this._days),f=me(this._months);a=p(d/60),b=p(a/60),d%=60,a%=60,c=p(f/12),f%=12;var g=c,h=f,i=e,j=b,k=a,l=d,m=this.asSeconds();return m?(0>m?"-":"")+"P"+(g?g+"Y":"")+(h?h+"M":"")+(i?i+"D":"")+(j||k||l?"T":"")+(j?j+"H":"")+(k?k+"M":"")+(l?l+"S":""):"P0D"}var Hc,Ic,Jc=a.momentProperties=[],Kc=!1,Lc={},Mc={},Nc=/(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,Oc=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,Pc={},Qc={},Rc=/\d/,Sc=/\d\d/,Tc=/\d{3}/,Uc=/\d{4}/,Vc=/[+-]?\d{6}/,Wc=/\d\d?/,Xc=/\d{1,3}/,Yc=/\d{1,4}/,Zc=/[+-]?\d{1,6}/,$c=/\d+/,_c=/[+-]?\d+/,ad=/Z|[+-]\d\d:?\d\d/gi,bd=/[+-]?\d+(\.\d{1,3})?/,cd=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,dd={},ed={},fd=0,gd=1,hd=2,id=3,jd=4,kd=5,ld=6;H("M",["MM",2],"Mo",function(){return this.month()+1}),H("MMM",0,0,function(a){return this.localeData().monthsShort(this,a)}),H("MMMM",0,0,function(a){return this.localeData().months(this,a)}),z("month","M"),N("M",Wc),N("MM",Wc,Sc),N("MMM",cd),N("MMMM",cd),Q(["M","MM"],function(a,b){b[gd]=q(a)-1}),Q(["MMM","MMMM"],function(a,b,c,d){var e=c._locale.monthsParse(a,d,c._strict);null!=e?b[gd]=e:j(c).invalidMonth=a});var md="January_February_March_April_May_June_July_August_September_October_November_December".split("_"),nd="Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),od={};a.suppressDeprecationWarnings=!1;var pd=/^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,qd=[["YYYYYY-MM-DD",/[+-]\d{6}-\d{2}-\d{2}/],["YYYY-MM-DD",/\d{4}-\d{2}-\d{2}/],["GGGG-[W]WW-E",/\d{4}-W\d{2}-\d/],["GGGG-[W]WW",/\d{4}-W\d{2}/],["YYYY-DDD",/\d{4}-\d{3}/]],rd=[["HH:mm:ss.SSSS",/(T| )\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss",/(T| )\d\d:\d\d:\d\d/],["HH:mm",/(T| )\d\d:\d\d/],["HH",/(T| )\d\d/]],sd=/^\/?Date\((\-?\d+)/i;a.createFromInputFallback=aa("moment construction falls back to js Date. This is discouraged and will be removed in upcoming major release. Please refer to https://github.com/moment/moment/issues/1407 for more info.",function(a){a._d=new Date(a._i+(a._useUTC?" UTC":""))}),H(0,["YY",2],0,function(){return this.year()%100}),H(0,["YYYY",4],0,"year"),H(0,["YYYYY",5],0,"year"),H(0,["YYYYYY",6,!0],0,"year"),z("year","y"),N("Y",_c),N("YY",Wc,Sc),N("YYYY",Yc,Uc),N("YYYYY",Zc,Vc),N("YYYYYY",Zc,Vc),Q(["YYYYY","YYYYYY"],fd),Q("YYYY",function(b,c){c[fd]=2===b.length?a.parseTwoDigitYear(b):q(b)}),Q("YY",function(b,c){c[fd]=a.parseTwoDigitYear(b)}),a.parseTwoDigitYear=function(a){return q(a)+(q(a)>68?1900:2e3)};var td=C("FullYear",!1);H("w",["ww",2],"wo","week"),H("W",["WW",2],"Wo","isoWeek"),z("week","w"),z("isoWeek","W"),N("w",Wc),N("ww",Wc,Sc),N("W",Wc),N("WW",Wc,Sc),R(["w","ww","W","WW"],function(a,b,c,d){b[d.substr(0,1)]=q(a)});var ud={dow:0,doy:6};H("DDD",["DDDD",3],"DDDo","dayOfYear"),z("dayOfYear","DDD"),N("DDD",Xc),N("DDDD",Tc),Q(["DDD","DDDD"],function(a,b,c){c._dayOfYear=q(a)}),a.ISO_8601=function(){};var vd=aa("moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548",function(){var a=Da.apply(null,arguments);return this>a?this:a}),wd=aa("moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548",function(){var a=Da.apply(null,arguments);return a>this?this:a});Ja("Z",":"),Ja("ZZ",""),N("Z",ad),N("ZZ",ad),Q(["Z","ZZ"],function(a,b,c){c._useUTC=!0,c._tzm=Ka(a)});var xd=/([\+\-]|\d\d)/gi;a.updateOffset=function(){};var yd=/(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,zd=/^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/;Ya.fn=Ha.prototype;var Ad=ab(1,"add"),Bd=ab(-1,"subtract");a.defaultFormat="YYYY-MM-DDTHH:mm:ssZ";var Cd=aa("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",function(a){return void 0===a?this.localeData():this.locale(a)});H(0,["gg",2],0,function(){return this.weekYear()%100}),H(0,["GG",2],0,function(){return this.isoWeekYear()%100}),Db("gggg","weekYear"),Db("ggggg","weekYear"),Db("GGGG","isoWeekYear"),Db("GGGGG","isoWeekYear"),z("weekYear","gg"),z("isoWeekYear","GG"),N("G",_c),N("g",_c),N("GG",Wc,Sc),N("gg",Wc,Sc),N("GGGG",Yc,Uc),N("gggg",Yc,Uc),N("GGGGG",Zc,Vc),N("ggggg",Zc,Vc),R(["gggg","ggggg","GGGG","GGGGG"],function(a,b,c,d){b[d.substr(0,2)]=q(a)}),R(["gg","GG"],function(b,c,d,e){c[e]=a.parseTwoDigitYear(b)}),H("Q",0,0,"quarter"),z("quarter","Q"),N("Q",Rc),Q("Q",function(a,b){b[gd]=3*(q(a)-1)}),H("D",["DD",2],"Do","date"),z("date","D"),N("D",Wc),N("DD",Wc,Sc),N("Do",function(a,b){return a?b._ordinalParse:b._ordinalParseLenient}),Q(["D","DD"],hd),Q("Do",function(a,b){b[hd]=q(a.match(Wc)[0],10)});var Dd=C("Date",!0);H("d",0,"do","day"),H("dd",0,0,function(a){return this.localeData().weekdaysMin(this,a)}),H("ddd",0,0,function(a){return this.localeData().weekdaysShort(this,a)}),H("dddd",0,0,function(a){return this.localeData().weekdays(this,a)}),H("e",0,0,"weekday"),H("E",0,0,"isoWeekday"),z("day","d"),z("weekday","e"),z("isoWeekday","E"),N("d",Wc),N("e",Wc),N("E",Wc),N("dd",cd),N("ddd",cd),N("dddd",cd),R(["dd","ddd","dddd"],function(a,b,c){var d=c._locale.weekdaysParse(a);null!=d?b.d=d:j(c).invalidWeekday=a}),R(["d","e","E"],function(a,b,c,d){b[d]=q(a)});var Ed="Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),Fd="Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),Gd="Su_Mo_Tu_We_Th_Fr_Sa".split("_");H("H",["HH",2],0,"hour"),H("h",["hh",2],0,function(){return this.hours()%12||12}),Sb("a",!0),Sb("A",!1),z("hour","h"),N("a",Tb),N("A",Tb),N("H",Wc),N("h",Wc),N("HH",Wc,Sc),N("hh",Wc,Sc),Q(["H","HH"],id),Q(["a","A"],function(a,b,c){c._isPm=c._locale.isPM(a),c._meridiem=a}),Q(["h","hh"],function(a,b,c){b[id]=q(a),j(c).bigHour=!0});var Hd=/[ap]\.?m?\.?/i,Id=C("Hours",!0);H("m",["mm",2],0,"minute"),z("minute","m"),N("m",Wc),N("mm",Wc,Sc),Q(["m","mm"],jd);var Jd=C("Minutes",!1);H("s",["ss",2],0,"second"),z("second","s"),N("s",Wc),N("ss",Wc,Sc),Q(["s","ss"],kd);var Kd=C("Seconds",!1);H("S",0,0,function(){return~~(this.millisecond()/100)}),H(0,["SS",2],0,function(){return~~(this.millisecond()/10)}),H(0,["SSS",3],0,"millisecond"),H(0,["SSSS",4],0,function(){return 10*this.millisecond()}),H(0,["SSSSS",5],0,function(){return 100*this.millisecond()}),H(0,["SSSSSS",6],0,function(){return 1e3*this.millisecond()}),H(0,["SSSSSSS",7],0,function(){return 1e4*this.millisecond()}),H(0,["SSSSSSSS",8],0,function(){return 1e5*this.millisecond()}),H(0,["SSSSSSSSS",9],0,function(){return 1e6*this.millisecond()}),z("millisecond","ms"),N("S",Xc,Rc),N("SS",Xc,Sc),N("SSS",Xc,Tc);var Ld;for(Ld="SSSS";Ld.length<=9;Ld+="S")N(Ld,$c);for(Ld="S";Ld.length<=9;Ld+="S")Q(Ld,Wb);var Md=C("Milliseconds",!1);H("z",0,0,"zoneAbbr"),H("zz",0,0,"zoneName");var Nd=n.prototype;Nd.add=Ad,Nd.calendar=cb,Nd.clone=db,Nd.diff=ib,Nd.endOf=ub,Nd.format=mb,Nd.from=nb,Nd.fromNow=ob,Nd.to=pb,Nd.toNow=qb,Nd.get=F,Nd.invalidAt=Cb,Nd.isAfter=eb,Nd.isBefore=fb,Nd.isBetween=gb,Nd.isSame=hb,Nd.isValid=Ab,Nd.lang=Cd,Nd.locale=rb,Nd.localeData=sb,Nd.max=wd,Nd.min=vd,Nd.parsingFlags=Bb,Nd.set=F,Nd.startOf=tb,Nd.subtract=Bd,Nd.toArray=yb,Nd.toObject=zb,Nd.toDate=xb,Nd.toISOString=lb,Nd.toJSON=lb,Nd.toString=kb,Nd.unix=wb,Nd.valueOf=vb,Nd.year=td,Nd.isLeapYear=ia,Nd.weekYear=Fb,Nd.isoWeekYear=Gb,Nd.quarter=Nd.quarters=Jb,Nd.month=Y,Nd.daysInMonth=Z,Nd.week=Nd.weeks=na,Nd.isoWeek=Nd.isoWeeks=oa,Nd.weeksInYear=Ib,Nd.isoWeeksInYear=Hb,Nd.date=Dd,Nd.day=Nd.days=Pb,Nd.weekday=Qb,Nd.isoWeekday=Rb,Nd.dayOfYear=qa,Nd.hour=Nd.hours=Id,Nd.minute=Nd.minutes=Jd,Nd.second=Nd.seconds=Kd,
Nd.millisecond=Nd.milliseconds=Md,Nd.utcOffset=Na,Nd.utc=Pa,Nd.local=Qa,Nd.parseZone=Ra,Nd.hasAlignedHourOffset=Sa,Nd.isDST=Ta,Nd.isDSTShifted=Ua,Nd.isLocal=Va,Nd.isUtcOffset=Wa,Nd.isUtc=Xa,Nd.isUTC=Xa,Nd.zoneAbbr=Xb,Nd.zoneName=Yb,Nd.dates=aa("dates accessor is deprecated. Use date instead.",Dd),Nd.months=aa("months accessor is deprecated. Use month instead",Y),Nd.years=aa("years accessor is deprecated. Use year instead",td),Nd.zone=aa("moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779",Oa);var Od=Nd,Pd={sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},Qd={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},Rd="Invalid date",Sd="%d",Td=/\d{1,2}/,Ud={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},Vd=s.prototype;Vd._calendar=Pd,Vd.calendar=_b,Vd._longDateFormat=Qd,Vd.longDateFormat=ac,Vd._invalidDate=Rd,Vd.invalidDate=bc,Vd._ordinal=Sd,Vd.ordinal=cc,Vd._ordinalParse=Td,Vd.preparse=dc,Vd.postformat=dc,Vd._relativeTime=Ud,Vd.relativeTime=ec,Vd.pastFuture=fc,Vd.set=gc,Vd.months=U,Vd._months=md,Vd.monthsShort=V,Vd._monthsShort=nd,Vd.monthsParse=W,Vd.week=ka,Vd._week=ud,Vd.firstDayOfYear=ma,Vd.firstDayOfWeek=la,Vd.weekdays=Lb,Vd._weekdays=Ed,Vd.weekdaysMin=Nb,Vd._weekdaysMin=Gd,Vd.weekdaysShort=Mb,Vd._weekdaysShort=Fd,Vd.weekdaysParse=Ob,Vd.isPM=Ub,Vd._meridiemParse=Hd,Vd.meridiem=Vb,w("en",{ordinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(a){var b=a%10,c=1===q(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th";return a+c}}),a.lang=aa("moment.lang is deprecated. Use moment.locale instead.",w),a.langData=aa("moment.langData is deprecated. Use moment.localeData instead.",y);var Wd=Math.abs,Xd=yc("ms"),Yd=yc("s"),Zd=yc("m"),$d=yc("h"),_d=yc("d"),ae=yc("w"),be=yc("M"),ce=yc("y"),de=Ac("milliseconds"),ee=Ac("seconds"),fe=Ac("minutes"),ge=Ac("hours"),he=Ac("days"),ie=Ac("months"),je=Ac("years"),ke=Math.round,le={s:45,m:45,h:22,d:26,M:11},me=Math.abs,ne=Ha.prototype;ne.abs=oc,ne.add=qc,ne.subtract=rc,ne.as=wc,ne.asMilliseconds=Xd,ne.asSeconds=Yd,ne.asMinutes=Zd,ne.asHours=$d,ne.asDays=_d,ne.asWeeks=ae,ne.asMonths=be,ne.asYears=ce,ne.valueOf=xc,ne._bubble=tc,ne.get=zc,ne.milliseconds=de,ne.seconds=ee,ne.minutes=fe,ne.hours=ge,ne.days=he,ne.weeks=Bc,ne.months=ie,ne.years=je,ne.humanize=Fc,ne.toISOString=Gc,ne.toString=Gc,ne.toJSON=Gc,ne.locale=rb,ne.localeData=sb,ne.toIsoString=aa("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",Gc),ne.lang=Cd,H("X",0,0,"unix"),H("x",0,0,"valueOf"),N("x",_c),N("X",bd),Q("X",function(a,b,c){c._d=new Date(1e3*parseFloat(a,10))}),Q("x",function(a,b,c){c._d=new Date(q(a))}),a.version="2.10.6",b(Da),a.fn=Od,a.min=Fa,a.max=Ga,a.utc=h,a.unix=Zb,a.months=jc,a.isDate=d,a.locale=w,a.invalid=l,a.duration=Ya,a.isMoment=o,a.weekdays=lc,a.parseZone=$b,a.localeData=y,a.isDuration=Ia,a.monthsShort=kc,a.weekdaysMin=nc,a.defineLocale=x,a.weekdaysShort=mc,a.normalizeUnits=A,a.relativeTimeThreshold=Ec;var oe=a;return oe});_.moment = moment;
delete this.moment;
(function(){
/*!

 handlebars v2.0.0

Copyright (C) 2011-2014 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

@license
*/
!function(a,b){"function"==typeof define&&define.amd?define([],b):"object"==typeof exports?module.exports=b():a.Handlebars=a.Handlebars||b()}(this,function(){var a=function(){"use strict";function a(a){this.string=a}var b;return a.prototype.toString=function(){return""+this.string},b=a}(),b=function(a){"use strict";function b(a){return i[a]}function c(a){for(var b=1;b<arguments.length;b++)for(var c in arguments[b])Object.prototype.hasOwnProperty.call(arguments[b],c)&&(a[c]=arguments[b][c]);return a}function d(a){return a instanceof h?a.toString():null==a?"":a?(a=""+a,k.test(a)?a.replace(j,b):a):a+""}function e(a){return a||0===a?n(a)&&0===a.length?!0:!1:!0}function f(a,b){return(a?a+".":"")+b}var g={},h=a,i={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},j=/[&<>"'`]/g,k=/[&<>"'`]/;g.extend=c;var l=Object.prototype.toString;g.toString=l;var m=function(a){return"function"==typeof a};m(/x/)&&(m=function(a){return"function"==typeof a&&"[object Function]"===l.call(a)});var m;g.isFunction=m;var n=Array.isArray||function(a){return a&&"object"==typeof a?"[object Array]"===l.call(a):!1};return g.isArray=n,g.escapeExpression=d,g.isEmpty=e,g.appendContextPath=f,g}(a),c=function(){"use strict";function a(a,b){var d;b&&b.firstLine&&(d=b.firstLine,a+=" - "+d+":"+b.firstColumn);for(var e=Error.prototype.constructor.call(this,a),f=0;f<c.length;f++)this[c[f]]=e[c[f]];d&&(this.lineNumber=d,this.column=b.firstColumn)}var b,c=["description","fileName","lineNumber","message","name","number","stack"];return a.prototype=new Error,b=a}(),d=function(a,b){"use strict";function c(a,b){this.helpers=a||{},this.partials=b||{},d(this)}function d(a){a.registerHelper("helperMissing",function(){if(1===arguments.length)return void 0;throw new g("Missing helper: '"+arguments[arguments.length-1].name+"'")}),a.registerHelper("blockHelperMissing",function(b,c){var d=c.inverse,e=c.fn;if(b===!0)return e(this);if(b===!1||null==b)return d(this);if(k(b))return b.length>0?(c.ids&&(c.ids=[c.name]),a.helpers.each(b,c)):d(this);if(c.data&&c.ids){var g=q(c.data);g.contextPath=f.appendContextPath(c.data.contextPath,c.name),c={data:g}}return e(b,c)}),a.registerHelper("each",function(a,b){if(!b)throw new g("Must pass iterator to #each");var c,d,e=b.fn,h=b.inverse,i=0,j="";if(b.data&&b.ids&&(d=f.appendContextPath(b.data.contextPath,b.ids[0])+"."),l(a)&&(a=a.call(this)),b.data&&(c=q(b.data)),a&&"object"==typeof a)if(k(a))for(var m=a.length;m>i;i++)c&&(c.index=i,c.first=0===i,c.last=i===a.length-1,d&&(c.contextPath=d+i)),j+=e(a[i],{data:c});else for(var n in a)a.hasOwnProperty(n)&&(c&&(c.key=n,c.index=i,c.first=0===i,d&&(c.contextPath=d+n)),j+=e(a[n],{data:c}),i++);return 0===i&&(j=h(this)),j}),a.registerHelper("if",function(a,b){return l(a)&&(a=a.call(this)),!b.hash.includeZero&&!a||f.isEmpty(a)?b.inverse(this):b.fn(this)}),a.registerHelper("unless",function(b,c){return a.helpers["if"].call(this,b,{fn:c.inverse,inverse:c.fn,hash:c.hash})}),a.registerHelper("with",function(a,b){l(a)&&(a=a.call(this));var c=b.fn;if(f.isEmpty(a))return b.inverse(this);if(b.data&&b.ids){var d=q(b.data);d.contextPath=f.appendContextPath(b.data.contextPath,b.ids[0]),b={data:d}}return c(a,b)}),a.registerHelper("log",function(b,c){var d=c.data&&null!=c.data.level?parseInt(c.data.level,10):1;a.log(d,b)}),a.registerHelper("lookup",function(a,b){return a&&a[b]})}var e={},f=a,g=b,h="2.0.0";e.VERSION=h;var i=6;e.COMPILER_REVISION=i;var j={1:"<= 1.0.rc.2",2:"== 1.0.0-rc.3",3:"== 1.0.0-rc.4",4:"== 1.x.x",5:"== 2.0.0-alpha.x",6:">= 2.0.0-beta.1"};e.REVISION_CHANGES=j;var k=f.isArray,l=f.isFunction,m=f.toString,n="[object Object]";e.HandlebarsEnvironment=c,c.prototype={constructor:c,logger:o,log:p,registerHelper:function(a,b){if(m.call(a)===n){if(b)throw new g("Arg not supported with multiple helpers");f.extend(this.helpers,a)}else this.helpers[a]=b},unregisterHelper:function(a){delete this.helpers[a]},registerPartial:function(a,b){m.call(a)===n?f.extend(this.partials,a):this.partials[a]=b},unregisterPartial:function(a){delete this.partials[a]}};var o={methodMap:{0:"debug",1:"info",2:"warn",3:"error"},DEBUG:0,INFO:1,WARN:2,ERROR:3,level:3,log:function(a,b){if(o.level<=a){var c=o.methodMap[a];"undefined"!=typeof console&&console[c]&&console[c].call(console,b)}}};e.logger=o;var p=o.log;e.log=p;var q=function(a){var b=f.extend({},a);return b._parent=a,b};return e.createFrame=q,e}(b,c),e=function(a,b,c){"use strict";function d(a){var b=a&&a[0]||1,c=m;if(b!==c){if(c>b){var d=n[c],e=n[b];throw new l("Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version ("+d+") or downgrade your runtime to an older version ("+e+").")}throw new l("Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version ("+a[1]+").")}}function e(a,b){if(!b)throw new l("No environment passed to template");if(!a||!a.main)throw new l("Unknown template object: "+typeof a);b.VM.checkRevision(a.compiler);var c=function(c,d,e,f,g,h,i,j,m){g&&(f=k.extend({},f,g));var n=b.VM.invokePartial.call(this,c,e,f,h,i,j,m);if(null==n&&b.compile){var o={helpers:h,partials:i,data:j,depths:m};i[e]=b.compile(c,{data:void 0!==j,compat:a.compat},b),n=i[e](f,o)}if(null!=n){if(d){for(var p=n.split("\n"),q=0,r=p.length;r>q&&(p[q]||q+1!==r);q++)p[q]=d+p[q];n=p.join("\n")}return n}throw new l("The partial "+e+" could not be compiled when running in runtime-only mode")},d={lookup:function(a,b){for(var c=a.length,d=0;c>d;d++)if(a[d]&&null!=a[d][b])return a[d][b]},lambda:function(a,b){return"function"==typeof a?a.call(b):a},escapeExpression:k.escapeExpression,invokePartial:c,fn:function(b){return a[b]},programs:[],program:function(a,b,c){var d=this.programs[a],e=this.fn(a);return b||c?d=f(this,a,e,b,c):d||(d=this.programs[a]=f(this,a,e)),d},data:function(a,b){for(;a&&b--;)a=a._parent;return a},merge:function(a,b){var c=a||b;return a&&b&&a!==b&&(c=k.extend({},b,a)),c},noop:b.VM.noop,compilerInfo:a.compiler},e=function(b,c){c=c||{};var f=c.data;e._setup(c),!c.partial&&a.useData&&(f=i(b,f));var g;return a.useDepths&&(g=c.depths?[b].concat(c.depths):[b]),a.main.call(d,b,d.helpers,d.partials,f,g)};return e.isTop=!0,e._setup=function(c){c.partial?(d.helpers=c.helpers,d.partials=c.partials):(d.helpers=d.merge(c.helpers,b.helpers),a.usePartial&&(d.partials=d.merge(c.partials,b.partials)))},e._child=function(b,c,e){if(a.useDepths&&!e)throw new l("must pass parent depths");return f(d,b,a[b],c,e)},e}function f(a,b,c,d,e){var f=function(b,f){return f=f||{},c.call(a,b,a.helpers,a.partials,f.data||d,e&&[b].concat(e))};return f.program=b,f.depth=e?e.length:0,f}function g(a,b,c,d,e,f,g){var h={partial:!0,helpers:d,partials:e,data:f,depths:g};if(void 0===a)throw new l("The partial "+b+" could not be found");return a instanceof Function?a(c,h):void 0}function h(){return""}function i(a,b){return b&&"root"in b||(b=b?o(b):{},b.root=a),b}var j={},k=a,l=b,m=c.COMPILER_REVISION,n=c.REVISION_CHANGES,o=c.createFrame;return j.checkRevision=d,j.template=e,j.program=f,j.invokePartial=g,j.noop=h,j}(b,c,d),f=function(a,b,c,d,e){"use strict";var f,g=a,h=b,i=c,j=d,k=e,l=function(){var a=new g.HandlebarsEnvironment;return j.extend(a,g),a.SafeString=h,a.Exception=i,a.Utils=j,a.escapeExpression=j.escapeExpression,a.VM=k,a.template=function(b){return k.template(b,a)},a},m=l();return m.create=l,m["default"]=m,f=m}(d,a,c,b,e),g=function(a){"use strict";function b(a){a=a||{},this.firstLine=a.first_line,this.firstColumn=a.first_column,this.lastColumn=a.last_column,this.lastLine=a.last_line}var c,d=a,e={ProgramNode:function(a,c,d){b.call(this,d),this.type="program",this.statements=a,this.strip=c},MustacheNode:function(a,c,d,f,g){if(b.call(this,g),this.type="mustache",this.strip=f,null!=d&&d.charAt){var h=d.charAt(3)||d.charAt(2);this.escaped="{"!==h&&"&"!==h}else this.escaped=!!d;this.sexpr=a instanceof e.SexprNode?a:new e.SexprNode(a,c),this.id=this.sexpr.id,this.params=this.sexpr.params,this.hash=this.sexpr.hash,this.eligibleHelper=this.sexpr.eligibleHelper,this.isHelper=this.sexpr.isHelper},SexprNode:function(a,c,d){b.call(this,d),this.type="sexpr",this.hash=c;var e=this.id=a[0],f=this.params=a.slice(1);this.isHelper=!(!f.length&&!c),this.eligibleHelper=this.isHelper||e.isSimple},PartialNode:function(a,c,d,e,f){b.call(this,f),this.type="partial",this.partialName=a,this.context=c,this.hash=d,this.strip=e,this.strip.inlineStandalone=!0},BlockNode:function(a,c,d,e,f){b.call(this,f),this.type="block",this.mustache=a,this.program=c,this.inverse=d,this.strip=e,d&&!c&&(this.isInverse=!0)},RawBlockNode:function(a,c,f,g){if(b.call(this,g),a.sexpr.id.original!==f)throw new d(a.sexpr.id.original+" doesn't match "+f,this);c=new e.ContentNode(c,g),this.type="block",this.mustache=a,this.program=new e.ProgramNode([c],{},g)},ContentNode:function(a,c){b.call(this,c),this.type="content",this.original=this.string=a},HashNode:function(a,c){b.call(this,c),this.type="hash",this.pairs=a},IdNode:function(a,c){b.call(this,c),this.type="ID";for(var e="",f=[],g=0,h="",i=0,j=a.length;j>i;i++){var k=a[i].part;if(e+=(a[i].separator||"")+k,".."===k||"."===k||"this"===k){if(f.length>0)throw new d("Invalid path: "+e,this);".."===k?(g++,h+="../"):this.isScoped=!0}else f.push(k)}this.original=e,this.parts=f,this.string=f.join("."),this.depth=g,this.idName=h+this.string,this.isSimple=1===a.length&&!this.isScoped&&0===g,this.stringModeValue=this.string},PartialNameNode:function(a,c){b.call(this,c),this.type="PARTIAL_NAME",this.name=a.original},DataNode:function(a,c){b.call(this,c),this.type="DATA",this.id=a,this.stringModeValue=a.stringModeValue,this.idName="@"+a.stringModeValue},StringNode:function(a,c){b.call(this,c),this.type="STRING",this.original=this.string=this.stringModeValue=a},NumberNode:function(a,c){b.call(this,c),this.type="NUMBER",this.original=this.number=a,this.stringModeValue=Number(a)},BooleanNode:function(a,c){b.call(this,c),this.type="BOOLEAN",this.bool=a,this.stringModeValue="true"===a},CommentNode:function(a,c){b.call(this,c),this.type="comment",this.comment=a,this.strip={inlineStandalone:!0}}};return c=e}(c),h=function(){"use strict";var a,b=function(){function a(){this.yy={}}var b={trace:function(){},yy:{},symbols_:{error:2,root:3,program:4,EOF:5,program_repetition0:6,statement:7,mustache:8,block:9,rawBlock:10,partial:11,CONTENT:12,COMMENT:13,openRawBlock:14,END_RAW_BLOCK:15,OPEN_RAW_BLOCK:16,sexpr:17,CLOSE_RAW_BLOCK:18,openBlock:19,block_option0:20,closeBlock:21,openInverse:22,block_option1:23,OPEN_BLOCK:24,CLOSE:25,OPEN_INVERSE:26,inverseAndProgram:27,INVERSE:28,OPEN_ENDBLOCK:29,path:30,OPEN:31,OPEN_UNESCAPED:32,CLOSE_UNESCAPED:33,OPEN_PARTIAL:34,partialName:35,param:36,partial_option0:37,partial_option1:38,sexpr_repetition0:39,sexpr_option0:40,dataName:41,STRING:42,NUMBER:43,BOOLEAN:44,OPEN_SEXPR:45,CLOSE_SEXPR:46,hash:47,hash_repetition_plus0:48,hashSegment:49,ID:50,EQUALS:51,DATA:52,pathSegments:53,SEP:54,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",12:"CONTENT",13:"COMMENT",15:"END_RAW_BLOCK",16:"OPEN_RAW_BLOCK",18:"CLOSE_RAW_BLOCK",24:"OPEN_BLOCK",25:"CLOSE",26:"OPEN_INVERSE",28:"INVERSE",29:"OPEN_ENDBLOCK",31:"OPEN",32:"OPEN_UNESCAPED",33:"CLOSE_UNESCAPED",34:"OPEN_PARTIAL",42:"STRING",43:"NUMBER",44:"BOOLEAN",45:"OPEN_SEXPR",46:"CLOSE_SEXPR",50:"ID",51:"EQUALS",52:"DATA",54:"SEP"},productions_:[0,[3,2],[4,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[10,3],[14,3],[9,4],[9,4],[19,3],[22,3],[27,2],[21,3],[8,3],[8,3],[11,5],[11,4],[17,3],[17,1],[36,1],[36,1],[36,1],[36,1],[36,1],[36,3],[47,1],[49,3],[35,1],[35,1],[35,1],[41,2],[30,1],[53,3],[53,1],[6,0],[6,2],[20,0],[20,1],[23,0],[23,1],[37,0],[37,1],[38,0],[38,1],[39,0],[39,2],[40,0],[40,1],[48,1],[48,2]],performAction:function(a,b,c,d,e,f){var g=f.length-1;switch(e){case 1:return d.prepareProgram(f[g-1].statements,!0),f[g-1];case 2:this.$=new d.ProgramNode(d.prepareProgram(f[g]),{},this._$);break;case 3:this.$=f[g];break;case 4:this.$=f[g];break;case 5:this.$=f[g];break;case 6:this.$=f[g];break;case 7:this.$=new d.ContentNode(f[g],this._$);break;case 8:this.$=new d.CommentNode(f[g],this._$);break;case 9:this.$=new d.RawBlockNode(f[g-2],f[g-1],f[g],this._$);break;case 10:this.$=new d.MustacheNode(f[g-1],null,"","",this._$);break;case 11:this.$=d.prepareBlock(f[g-3],f[g-2],f[g-1],f[g],!1,this._$);break;case 12:this.$=d.prepareBlock(f[g-3],f[g-2],f[g-1],f[g],!0,this._$);break;case 13:this.$=new d.MustacheNode(f[g-1],null,f[g-2],d.stripFlags(f[g-2],f[g]),this._$);break;case 14:this.$=new d.MustacheNode(f[g-1],null,f[g-2],d.stripFlags(f[g-2],f[g]),this._$);break;case 15:this.$={strip:d.stripFlags(f[g-1],f[g-1]),program:f[g]};break;case 16:this.$={path:f[g-1],strip:d.stripFlags(f[g-2],f[g])};break;case 17:this.$=new d.MustacheNode(f[g-1],null,f[g-2],d.stripFlags(f[g-2],f[g]),this._$);break;case 18:this.$=new d.MustacheNode(f[g-1],null,f[g-2],d.stripFlags(f[g-2],f[g]),this._$);break;case 19:this.$=new d.PartialNode(f[g-3],f[g-2],f[g-1],d.stripFlags(f[g-4],f[g]),this._$);break;case 20:this.$=new d.PartialNode(f[g-2],void 0,f[g-1],d.stripFlags(f[g-3],f[g]),this._$);break;case 21:this.$=new d.SexprNode([f[g-2]].concat(f[g-1]),f[g],this._$);break;case 22:this.$=new d.SexprNode([f[g]],null,this._$);break;case 23:this.$=f[g];break;case 24:this.$=new d.StringNode(f[g],this._$);break;case 25:this.$=new d.NumberNode(f[g],this._$);break;case 26:this.$=new d.BooleanNode(f[g],this._$);break;case 27:this.$=f[g];break;case 28:f[g-1].isHelper=!0,this.$=f[g-1];break;case 29:this.$=new d.HashNode(f[g],this._$);break;case 30:this.$=[f[g-2],f[g]];break;case 31:this.$=new d.PartialNameNode(f[g],this._$);break;case 32:this.$=new d.PartialNameNode(new d.StringNode(f[g],this._$),this._$);break;case 33:this.$=new d.PartialNameNode(new d.NumberNode(f[g],this._$));break;case 34:this.$=new d.DataNode(f[g],this._$);break;case 35:this.$=new d.IdNode(f[g],this._$);break;case 36:f[g-2].push({part:f[g],separator:f[g-1]}),this.$=f[g-2];break;case 37:this.$=[{part:f[g]}];break;case 38:this.$=[];break;case 39:f[g-1].push(f[g]);break;case 48:this.$=[];break;case 49:f[g-1].push(f[g]);break;case 52:this.$=[f[g]];break;case 53:f[g-1].push(f[g])}},table:[{3:1,4:2,5:[2,38],6:3,12:[2,38],13:[2,38],16:[2,38],24:[2,38],26:[2,38],31:[2,38],32:[2,38],34:[2,38]},{1:[3]},{5:[1,4]},{5:[2,2],7:5,8:6,9:7,10:8,11:9,12:[1,10],13:[1,11],14:16,16:[1,20],19:14,22:15,24:[1,18],26:[1,19],28:[2,2],29:[2,2],31:[1,12],32:[1,13],34:[1,17]},{1:[2,1]},{5:[2,39],12:[2,39],13:[2,39],16:[2,39],24:[2,39],26:[2,39],28:[2,39],29:[2,39],31:[2,39],32:[2,39],34:[2,39]},{5:[2,3],12:[2,3],13:[2,3],16:[2,3],24:[2,3],26:[2,3],28:[2,3],29:[2,3],31:[2,3],32:[2,3],34:[2,3]},{5:[2,4],12:[2,4],13:[2,4],16:[2,4],24:[2,4],26:[2,4],28:[2,4],29:[2,4],31:[2,4],32:[2,4],34:[2,4]},{5:[2,5],12:[2,5],13:[2,5],16:[2,5],24:[2,5],26:[2,5],28:[2,5],29:[2,5],31:[2,5],32:[2,5],34:[2,5]},{5:[2,6],12:[2,6],13:[2,6],16:[2,6],24:[2,6],26:[2,6],28:[2,6],29:[2,6],31:[2,6],32:[2,6],34:[2,6]},{5:[2,7],12:[2,7],13:[2,7],16:[2,7],24:[2,7],26:[2,7],28:[2,7],29:[2,7],31:[2,7],32:[2,7],34:[2,7]},{5:[2,8],12:[2,8],13:[2,8],16:[2,8],24:[2,8],26:[2,8],28:[2,8],29:[2,8],31:[2,8],32:[2,8],34:[2,8]},{17:21,30:22,41:23,50:[1,26],52:[1,25],53:24},{17:27,30:22,41:23,50:[1,26],52:[1,25],53:24},{4:28,6:3,12:[2,38],13:[2,38],16:[2,38],24:[2,38],26:[2,38],28:[2,38],29:[2,38],31:[2,38],32:[2,38],34:[2,38]},{4:29,6:3,12:[2,38],13:[2,38],16:[2,38],24:[2,38],26:[2,38],28:[2,38],29:[2,38],31:[2,38],32:[2,38],34:[2,38]},{12:[1,30]},{30:32,35:31,42:[1,33],43:[1,34],50:[1,26],53:24},{17:35,30:22,41:23,50:[1,26],52:[1,25],53:24},{17:36,30:22,41:23,50:[1,26],52:[1,25],53:24},{17:37,30:22,41:23,50:[1,26],52:[1,25],53:24},{25:[1,38]},{18:[2,48],25:[2,48],33:[2,48],39:39,42:[2,48],43:[2,48],44:[2,48],45:[2,48],46:[2,48],50:[2,48],52:[2,48]},{18:[2,22],25:[2,22],33:[2,22],46:[2,22]},{18:[2,35],25:[2,35],33:[2,35],42:[2,35],43:[2,35],44:[2,35],45:[2,35],46:[2,35],50:[2,35],52:[2,35],54:[1,40]},{30:41,50:[1,26],53:24},{18:[2,37],25:[2,37],33:[2,37],42:[2,37],43:[2,37],44:[2,37],45:[2,37],46:[2,37],50:[2,37],52:[2,37],54:[2,37]},{33:[1,42]},{20:43,27:44,28:[1,45],29:[2,40]},{23:46,27:47,28:[1,45],29:[2,42]},{15:[1,48]},{25:[2,46],30:51,36:49,38:50,41:55,42:[1,52],43:[1,53],44:[1,54],45:[1,56],47:57,48:58,49:60,50:[1,59],52:[1,25],53:24},{25:[2,31],42:[2,31],43:[2,31],44:[2,31],45:[2,31],50:[2,31],52:[2,31]},{25:[2,32],42:[2,32],43:[2,32],44:[2,32],45:[2,32],50:[2,32],52:[2,32]},{25:[2,33],42:[2,33],43:[2,33],44:[2,33],45:[2,33],50:[2,33],52:[2,33]},{25:[1,61]},{25:[1,62]},{18:[1,63]},{5:[2,17],12:[2,17],13:[2,17],16:[2,17],24:[2,17],26:[2,17],28:[2,17],29:[2,17],31:[2,17],32:[2,17],34:[2,17]},{18:[2,50],25:[2,50],30:51,33:[2,50],36:65,40:64,41:55,42:[1,52],43:[1,53],44:[1,54],45:[1,56],46:[2,50],47:66,48:58,49:60,50:[1,59],52:[1,25],53:24},{50:[1,67]},{18:[2,34],25:[2,34],33:[2,34],42:[2,34],43:[2,34],44:[2,34],45:[2,34],46:[2,34],50:[2,34],52:[2,34]},{5:[2,18],12:[2,18],13:[2,18],16:[2,18],24:[2,18],26:[2,18],28:[2,18],29:[2,18],31:[2,18],32:[2,18],34:[2,18]},{21:68,29:[1,69]},{29:[2,41]},{4:70,6:3,12:[2,38],13:[2,38],16:[2,38],24:[2,38],26:[2,38],29:[2,38],31:[2,38],32:[2,38],34:[2,38]},{21:71,29:[1,69]},{29:[2,43]},{5:[2,9],12:[2,9],13:[2,9],16:[2,9],24:[2,9],26:[2,9],28:[2,9],29:[2,9],31:[2,9],32:[2,9],34:[2,9]},{25:[2,44],37:72,47:73,48:58,49:60,50:[1,74]},{25:[1,75]},{18:[2,23],25:[2,23],33:[2,23],42:[2,23],43:[2,23],44:[2,23],45:[2,23],46:[2,23],50:[2,23],52:[2,23]},{18:[2,24],25:[2,24],33:[2,24],42:[2,24],43:[2,24],44:[2,24],45:[2,24],46:[2,24],50:[2,24],52:[2,24]},{18:[2,25],25:[2,25],33:[2,25],42:[2,25],43:[2,25],44:[2,25],45:[2,25],46:[2,25],50:[2,25],52:[2,25]},{18:[2,26],25:[2,26],33:[2,26],42:[2,26],43:[2,26],44:[2,26],45:[2,26],46:[2,26],50:[2,26],52:[2,26]},{18:[2,27],25:[2,27],33:[2,27],42:[2,27],43:[2,27],44:[2,27],45:[2,27],46:[2,27],50:[2,27],52:[2,27]},{17:76,30:22,41:23,50:[1,26],52:[1,25],53:24},{25:[2,47]},{18:[2,29],25:[2,29],33:[2,29],46:[2,29],49:77,50:[1,74]},{18:[2,37],25:[2,37],33:[2,37],42:[2,37],43:[2,37],44:[2,37],45:[2,37],46:[2,37],50:[2,37],51:[1,78],52:[2,37],54:[2,37]},{18:[2,52],25:[2,52],33:[2,52],46:[2,52],50:[2,52]},{12:[2,13],13:[2,13],16:[2,13],24:[2,13],26:[2,13],28:[2,13],29:[2,13],31:[2,13],32:[2,13],34:[2,13]},{12:[2,14],13:[2,14],16:[2,14],24:[2,14],26:[2,14],28:[2,14],29:[2,14],31:[2,14],32:[2,14],34:[2,14]},{12:[2,10]},{18:[2,21],25:[2,21],33:[2,21],46:[2,21]},{18:[2,49],25:[2,49],33:[2,49],42:[2,49],43:[2,49],44:[2,49],45:[2,49],46:[2,49],50:[2,49],52:[2,49]},{18:[2,51],25:[2,51],33:[2,51],46:[2,51]},{18:[2,36],25:[2,36],33:[2,36],42:[2,36],43:[2,36],44:[2,36],45:[2,36],46:[2,36],50:[2,36],52:[2,36],54:[2,36]},{5:[2,11],12:[2,11],13:[2,11],16:[2,11],24:[2,11],26:[2,11],28:[2,11],29:[2,11],31:[2,11],32:[2,11],34:[2,11]},{30:79,50:[1,26],53:24},{29:[2,15]},{5:[2,12],12:[2,12],13:[2,12],16:[2,12],24:[2,12],26:[2,12],28:[2,12],29:[2,12],31:[2,12],32:[2,12],34:[2,12]},{25:[1,80]},{25:[2,45]},{51:[1,78]},{5:[2,20],12:[2,20],13:[2,20],16:[2,20],24:[2,20],26:[2,20],28:[2,20],29:[2,20],31:[2,20],32:[2,20],34:[2,20]},{46:[1,81]},{18:[2,53],25:[2,53],33:[2,53],46:[2,53],50:[2,53]},{30:51,36:82,41:55,42:[1,52],43:[1,53],44:[1,54],45:[1,56],50:[1,26],52:[1,25],53:24},{25:[1,83]},{5:[2,19],12:[2,19],13:[2,19],16:[2,19],24:[2,19],26:[2,19],28:[2,19],29:[2,19],31:[2,19],32:[2,19],34:[2,19]},{18:[2,28],25:[2,28],33:[2,28],42:[2,28],43:[2,28],44:[2,28],45:[2,28],46:[2,28],50:[2,28],52:[2,28]},{18:[2,30],25:[2,30],33:[2,30],46:[2,30],50:[2,30]},{5:[2,16],12:[2,16],13:[2,16],16:[2,16],24:[2,16],26:[2,16],28:[2,16],29:[2,16],31:[2,16],32:[2,16],34:[2,16]}],defaultActions:{4:[2,1],44:[2,41],47:[2,43],57:[2,47],63:[2,10],70:[2,15],73:[2,45]},parseError:function(a){throw new Error(a)},parse:function(a){function b(){var a;return a=c.lexer.lex()||1,"number"!=typeof a&&(a=c.symbols_[a]||a),a}var c=this,d=[0],e=[null],f=[],g=this.table,h="",i=0,j=0,k=0;this.lexer.setInput(a),this.lexer.yy=this.yy,this.yy.lexer=this.lexer,this.yy.parser=this,"undefined"==typeof this.lexer.yylloc&&(this.lexer.yylloc={});var l=this.lexer.yylloc;f.push(l);var m=this.lexer.options&&this.lexer.options.ranges;"function"==typeof this.yy.parseError&&(this.parseError=this.yy.parseError);for(var n,o,p,q,r,s,t,u,v,w={};;){if(p=d[d.length-1],this.defaultActions[p]?q=this.defaultActions[p]:((null===n||"undefined"==typeof n)&&(n=b()),q=g[p]&&g[p][n]),"undefined"==typeof q||!q.length||!q[0]){var x="";if(!k){v=[];for(s in g[p])this.terminals_[s]&&s>2&&v.push("'"+this.terminals_[s]+"'");x=this.lexer.showPosition?"Parse error on line "+(i+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+v.join(", ")+", got '"+(this.terminals_[n]||n)+"'":"Parse error on line "+(i+1)+": Unexpected "+(1==n?"end of input":"'"+(this.terminals_[n]||n)+"'"),this.parseError(x,{text:this.lexer.match,token:this.terminals_[n]||n,line:this.lexer.yylineno,loc:l,expected:v})}}if(q[0]instanceof Array&&q.length>1)throw new Error("Parse Error: multiple actions possible at state: "+p+", token: "+n);switch(q[0]){case 1:d.push(n),e.push(this.lexer.yytext),f.push(this.lexer.yylloc),d.push(q[1]),n=null,o?(n=o,o=null):(j=this.lexer.yyleng,h=this.lexer.yytext,i=this.lexer.yylineno,l=this.lexer.yylloc,k>0&&k--);break;case 2:if(t=this.productions_[q[1]][1],w.$=e[e.length-t],w._$={first_line:f[f.length-(t||1)].first_line,last_line:f[f.length-1].last_line,first_column:f[f.length-(t||1)].first_column,last_column:f[f.length-1].last_column},m&&(w._$.range=[f[f.length-(t||1)].range[0],f[f.length-1].range[1]]),r=this.performAction.call(w,h,j,i,this.yy,q[1],e,f),"undefined"!=typeof r)return r;t&&(d=d.slice(0,-1*t*2),e=e.slice(0,-1*t),f=f.slice(0,-1*t)),d.push(this.productions_[q[1]][0]),e.push(w.$),f.push(w._$),u=g[d[d.length-2]][d[d.length-1]],d.push(u);break;case 3:return!0}}return!0}},c=function(){var a={EOF:1,parseError:function(a,b){if(!this.yy.parser)throw new Error(a);this.yy.parser.parseError(a,b)},setInput:function(a){return this._input=a,this._more=this._less=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var a=this._input[0];this.yytext+=a,this.yyleng++,this.offset++,this.match+=a,this.matched+=a;var b=a.match(/(?:\r\n?|\n).*/g);return b?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),a},unput:function(a){var b=a.length,c=a.split(/(?:\r\n?|\n)/g);this._input=a+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-b-1),this.offset-=b;var d=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),c.length-1&&(this.yylineno-=c.length-1);var e=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:c?(c.length===d.length?this.yylloc.first_column:0)+d[d.length-c.length].length-c[0].length:this.yylloc.first_column-b},this.options.ranges&&(this.yylloc.range=[e[0],e[0]+this.yyleng-b]),this},more:function(){return this._more=!0,this},less:function(a){this.unput(this.match.slice(a))},pastInput:function(){var a=this.matched.substr(0,this.matched.length-this.match.length);return(a.length>20?"...":"")+a.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var a=this.match;return a.length<20&&(a+=this._input.substr(0,20-a.length)),(a.substr(0,20)+(a.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var a=this.pastInput(),b=new Array(a.length+1).join("-");return a+this.upcomingInput()+"\n"+b+"^"},next:function(){if(this.done)return this.EOF;this._input||(this.done=!0);var a,b,c,d,e;this._more||(this.yytext="",this.match="");for(var f=this._currentRules(),g=0;g<f.length&&(c=this._input.match(this.rules[f[g]]),!c||b&&!(c[0].length>b[0].length)||(b=c,d=g,this.options.flex));g++);return b?(e=b[0].match(/(?:\r\n?|\n).*/g),e&&(this.yylineno+=e.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:e?e[e.length-1].length-e[e.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+b[0].length},this.yytext+=b[0],this.match+=b[0],this.matches=b,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._input=this._input.slice(b[0].length),this.matched+=b[0],a=this.performAction.call(this,this.yy,this,f[d],this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),a?a:void 0):""===this._input?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var a=this.next();return"undefined"!=typeof a?a:this.lex()},begin:function(a){this.conditionStack.push(a)},popState:function(){return this.conditionStack.pop()},_currentRules:function(){return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules},topState:function(){return this.conditionStack[this.conditionStack.length-2]},pushState:function(a){this.begin(a)}};return a.options={},a.performAction=function(a,b,c,d){function e(a,c){return b.yytext=b.yytext.substr(a,b.yyleng-c)}switch(c){case 0:if("\\\\"===b.yytext.slice(-2)?(e(0,1),this.begin("mu")):"\\"===b.yytext.slice(-1)?(e(0,1),this.begin("emu")):this.begin("mu"),b.yytext)return 12;break;case 1:return 12;case 2:return this.popState(),12;case 3:return b.yytext=b.yytext.substr(5,b.yyleng-9),this.popState(),15;case 4:return 12;case 5:return e(0,4),this.popState(),13;case 6:return 45;case 7:return 46;case 8:return 16;case 9:return this.popState(),this.begin("raw"),18;case 10:return 34;case 11:return 24;case 12:return 29;case 13:return this.popState(),28;case 14:return this.popState(),28;case 15:return 26;case 16:return 26;case 17:return 32;case 18:return 31;case 19:this.popState(),this.begin("com");break;case 20:return e(3,5),this.popState(),13;case 21:return 31;case 22:return 51;case 23:return 50;case 24:return 50;case 25:return 54;case 26:break;case 27:return this.popState(),33;case 28:return this.popState(),25;case 29:return b.yytext=e(1,2).replace(/\\"/g,'"'),42;case 30:return b.yytext=e(1,2).replace(/\\'/g,"'"),42;case 31:return 52;case 32:return 44;case 33:return 44;case 34:return 43;case 35:return 50;case 36:return b.yytext=e(1,2),50;case 37:return"INVALID";case 38:return 5}},a.rules=[/^(?:[^\x00]*?(?=(\{\{)))/,/^(?:[^\x00]+)/,/^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/,/^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/,/^(?:[^\x00]*?(?=(\{\{\{\{\/)))/,/^(?:[\s\S]*?--\}\})/,/^(?:\()/,/^(?:\))/,/^(?:\{\{\{\{)/,/^(?:\}\}\}\})/,/^(?:\{\{(~)?>)/,/^(?:\{\{(~)?#)/,/^(?:\{\{(~)?\/)/,/^(?:\{\{(~)?\^\s*(~)?\}\})/,/^(?:\{\{(~)?\s*else\s*(~)?\}\})/,/^(?:\{\{(~)?\^)/,/^(?:\{\{(~)?\s*else\b)/,/^(?:\{\{(~)?\{)/,/^(?:\{\{(~)?&)/,/^(?:\{\{!--)/,/^(?:\{\{![\s\S]*?\}\})/,/^(?:\{\{(~)?)/,/^(?:=)/,/^(?:\.\.)/,/^(?:\.(?=([=~}\s\/.)])))/,/^(?:[\/.])/,/^(?:\s+)/,/^(?:\}(~)?\}\})/,/^(?:(~)?\}\})/,/^(?:"(\\["]|[^"])*")/,/^(?:'(\\[']|[^'])*')/,/^(?:@)/,/^(?:true(?=([~}\s)])))/,/^(?:false(?=([~}\s)])))/,/^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)])))/,/^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)]))))/,/^(?:\[[^\]]*\])/,/^(?:.)/,/^(?:$)/],a.conditions={mu:{rules:[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38],inclusive:!1},emu:{rules:[2],inclusive:!1},com:{rules:[5],inclusive:!1},raw:{rules:[3,4],inclusive:!1},INITIAL:{rules:[0,1,38],inclusive:!0}},a}();return b.lexer=c,a.prototype=b,b.Parser=a,new a}();return a=b}(),i=function(a){"use strict";function b(a,b){return{left:"~"===a.charAt(2),right:"~"===b.charAt(b.length-3)}}function c(a,b,c,d,i,k){if(a.sexpr.id.original!==d.path.original)throw new j(a.sexpr.id.original+" doesn't match "+d.path.original,a);var l=c&&c.program,m={left:a.strip.left,right:d.strip.right,openStandalone:f(b.statements),closeStandalone:e((l||b).statements)};if(a.strip.right&&g(b.statements,null,!0),l){var n=c.strip;n.left&&h(b.statements,null,!0),n.right&&g(l.statements,null,!0),d.strip.left&&h(l.statements,null,!0),e(b.statements)&&f(l.statements)&&(h(b.statements),g(l.statements))}else d.strip.left&&h(b.statements,null,!0);return i?new this.BlockNode(a,l,b,m,k):new this.BlockNode(a,b,l,m,k)}function d(a,b){for(var c=0,d=a.length;d>c;c++){var i=a[c],j=i.strip;if(j){var k=e(a,c,b,"partial"===i.type),l=f(a,c,b),m=j.openStandalone&&k,n=j.closeStandalone&&l,o=j.inlineStandalone&&k&&l;j.right&&g(a,c,!0),j.left&&h(a,c,!0),o&&(g(a,c),h(a,c)&&"partial"===i.type&&(i.indent=/([ \t]+$)/.exec(a[c-1].original)?RegExp.$1:"")),m&&(g((i.program||i.inverse).statements),h(a,c)),n&&(g(a,c),h((i.inverse||i.program).statements))}}return a}function e(a,b,c){void 0===b&&(b=a.length);var d=a[b-1],e=a[b-2];return d?"content"===d.type?(e||!c?/\r?\n\s*?$/:/(^|\r?\n)\s*?$/).test(d.original):void 0:c}function f(a,b,c){void 0===b&&(b=-1);var d=a[b+1],e=a[b+2];return d?"content"===d.type?(e||!c?/^\s*?\r?\n/:/^\s*?(\r?\n|$)/).test(d.original):void 0:c}function g(a,b,c){var d=a[null==b?0:b+1];if(d&&"content"===d.type&&(c||!d.rightStripped)){var e=d.string;d.string=d.string.replace(c?/^\s+/:/^[ \t]*\r?\n?/,""),d.rightStripped=d.string!==e}}function h(a,b,c){var d=a[null==b?a.length-1:b-1];if(d&&"content"===d.type&&(c||!d.leftStripped)){var e=d.string;return d.string=d.string.replace(c?/\s+$/:/[ \t]+$/,""),d.leftStripped=d.string!==e,d.leftStripped}}var i={},j=a;return i.stripFlags=b,i.prepareBlock=c,i.prepareProgram=d,i}(c),j=function(a,b,c,d){"use strict";function e(a){return a.constructor===h.ProgramNode?a:(g.yy=k,g.parse(a))}var f={},g=a,h=b,i=c,j=d.extend;f.parser=g;var k={};return j(k,i,h),f.parse=e,f}(h,g,i,b),k=function(a,b){"use strict";function c(){}function d(a,b,c){if(null==a||"string"!=typeof a&&a.constructor!==c.AST.ProgramNode)throw new h("You must pass a string or Handlebars AST to Handlebars.precompile. You passed "+a);b=b||{},"data"in b||(b.data=!0),b.compat&&(b.useDepths=!0);var d=c.parse(a),e=(new c.Compiler).compile(d,b);return(new c.JavaScriptCompiler).compile(e,b)}function e(a,b,c){function d(){var d=c.parse(a),e=(new c.Compiler).compile(d,b),f=(new c.JavaScriptCompiler).compile(e,b,void 0,!0);return c.template(f)}if(null==a||"string"!=typeof a&&a.constructor!==c.AST.ProgramNode)throw new h("You must pass a string or Handlebars AST to Handlebars.compile. You passed "+a);b=b||{},"data"in b||(b.data=!0),b.compat&&(b.useDepths=!0);var e,f=function(a,b){return e||(e=d()),e.call(this,a,b)};return f._setup=function(a){return e||(e=d()),e._setup(a)},f._child=function(a,b,c){return e||(e=d()),e._child(a,b,c)},f}function f(a,b){if(a===b)return!0;if(i(a)&&i(b)&&a.length===b.length){for(var c=0;c<a.length;c++)if(!f(a[c],b[c]))return!1;return!0}}var g={},h=a,i=b.isArray,j=[].slice;return g.Compiler=c,c.prototype={compiler:c,equals:function(a){var b=this.opcodes.length;if(a.opcodes.length!==b)return!1;for(var c=0;b>c;c++){var d=this.opcodes[c],e=a.opcodes[c];if(d.opcode!==e.opcode||!f(d.args,e.args))return!1}for(b=this.children.length,c=0;b>c;c++)if(!this.children[c].equals(a.children[c]))return!1;return!0},guid:0,compile:function(a,b){this.opcodes=[],this.children=[],this.depths={list:[]},this.options=b,this.stringParams=b.stringParams,this.trackIds=b.trackIds;var c=this.options.knownHelpers;if(this.options.knownHelpers={helperMissing:!0,blockHelperMissing:!0,each:!0,"if":!0,unless:!0,"with":!0,log:!0,lookup:!0},c)for(var d in c)this.options.knownHelpers[d]=c[d];return this.accept(a)},accept:function(a){return this[a.type](a)},program:function(a){for(var b=a.statements,c=0,d=b.length;d>c;c++)this.accept(b[c]);return this.isSimple=1===d,this.depths.list=this.depths.list.sort(function(a,b){return a-b}),this},compileProgram:function(a){var b,c=(new this.compiler).compile(a,this.options),d=this.guid++;
this.usePartial=this.usePartial||c.usePartial,this.children[d]=c;for(var e=0,f=c.depths.list.length;f>e;e++)b=c.depths.list[e],2>b||this.addDepth(b-1);return d},block:function(a){var b=a.mustache,c=a.program,d=a.inverse;c&&(c=this.compileProgram(c)),d&&(d=this.compileProgram(d));var e=b.sexpr,f=this.classifySexpr(e);"helper"===f?this.helperSexpr(e,c,d):"simple"===f?(this.simpleSexpr(e),this.opcode("pushProgram",c),this.opcode("pushProgram",d),this.opcode("emptyHash"),this.opcode("blockValue",e.id.original)):(this.ambiguousSexpr(e,c,d),this.opcode("pushProgram",c),this.opcode("pushProgram",d),this.opcode("emptyHash"),this.opcode("ambiguousBlockValue")),this.opcode("append")},hash:function(a){var b,c,d=a.pairs;for(this.opcode("pushHash"),b=0,c=d.length;c>b;b++)this.pushParam(d[b][1]);for(;b--;)this.opcode("assignToHash",d[b][0]);this.opcode("popHash")},partial:function(a){var b=a.partialName;this.usePartial=!0,a.hash?this.accept(a.hash):this.opcode("push","undefined"),a.context?this.accept(a.context):(this.opcode("getContext",0),this.opcode("pushContext")),this.opcode("invokePartial",b.name,a.indent||""),this.opcode("append")},content:function(a){a.string&&this.opcode("appendContent",a.string)},mustache:function(a){this.sexpr(a.sexpr),a.escaped&&!this.options.noEscape?this.opcode("appendEscaped"):this.opcode("append")},ambiguousSexpr:function(a,b,c){var d=a.id,e=d.parts[0],f=null!=b||null!=c;this.opcode("getContext",d.depth),this.opcode("pushProgram",b),this.opcode("pushProgram",c),this.ID(d),this.opcode("invokeAmbiguous",e,f)},simpleSexpr:function(a){var b=a.id;"DATA"===b.type?this.DATA(b):b.parts.length?this.ID(b):(this.addDepth(b.depth),this.opcode("getContext",b.depth),this.opcode("pushContext")),this.opcode("resolvePossibleLambda")},helperSexpr:function(a,b,c){var d=this.setupFullMustacheParams(a,b,c),e=a.id,f=e.parts[0];if(this.options.knownHelpers[f])this.opcode("invokeKnownHelper",d.length,f);else{if(this.options.knownHelpersOnly)throw new h("You specified knownHelpersOnly, but used the unknown helper "+f,a);e.falsy=!0,this.ID(e),this.opcode("invokeHelper",d.length,e.original,e.isSimple)}},sexpr:function(a){var b=this.classifySexpr(a);"simple"===b?this.simpleSexpr(a):"helper"===b?this.helperSexpr(a):this.ambiguousSexpr(a)},ID:function(a){this.addDepth(a.depth),this.opcode("getContext",a.depth);var b=a.parts[0];b?this.opcode("lookupOnContext",a.parts,a.falsy,a.isScoped):this.opcode("pushContext")},DATA:function(a){this.options.data=!0,this.opcode("lookupData",a.id.depth,a.id.parts)},STRING:function(a){this.opcode("pushString",a.string)},NUMBER:function(a){this.opcode("pushLiteral",a.number)},BOOLEAN:function(a){this.opcode("pushLiteral",a.bool)},comment:function(){},opcode:function(a){this.opcodes.push({opcode:a,args:j.call(arguments,1)})},addDepth:function(a){0!==a&&(this.depths[a]||(this.depths[a]=!0,this.depths.list.push(a)))},classifySexpr:function(a){var b=a.isHelper,c=a.eligibleHelper,d=this.options;if(c&&!b){var e=a.id.parts[0];d.knownHelpers[e]?b=!0:d.knownHelpersOnly&&(c=!1)}return b?"helper":c?"ambiguous":"simple"},pushParams:function(a){for(var b=0,c=a.length;c>b;b++)this.pushParam(a[b])},pushParam:function(a){this.stringParams?(a.depth&&this.addDepth(a.depth),this.opcode("getContext",a.depth||0),this.opcode("pushStringParam",a.stringModeValue,a.type),"sexpr"===a.type&&this.sexpr(a)):(this.trackIds&&this.opcode("pushId",a.type,a.idName||a.stringModeValue),this.accept(a))},setupFullMustacheParams:function(a,b,c){var d=a.params;return this.pushParams(d),this.opcode("pushProgram",b),this.opcode("pushProgram",c),a.hash?this.hash(a.hash):this.opcode("emptyHash"),d}},g.precompile=d,g.compile=e,g}(c,b),l=function(a,b){"use strict";function c(a){this.value=a}function d(){}var e,f=a.COMPILER_REVISION,g=a.REVISION_CHANGES,h=b;d.prototype={nameLookup:function(a,b){return d.isValidJavaScriptVariableName(b)?a+"."+b:a+"['"+b+"']"},depthedLookup:function(a){return this.aliases.lookup="this.lookup",'lookup(depths, "'+a+'")'},compilerInfo:function(){var a=f,b=g[a];return[a,b]},appendToBuffer:function(a){return this.environment.isSimple?"return "+a+";":{appendToBuffer:!0,content:a,toString:function(){return"buffer += "+a+";"}}},initializeBuffer:function(){return this.quotedString("")},namespace:"Handlebars",compile:function(a,b,c,d){this.environment=a,this.options=b,this.stringParams=this.options.stringParams,this.trackIds=this.options.trackIds,this.precompile=!d,this.name=this.environment.name,this.isChild=!!c,this.context=c||{programs:[],environments:[]},this.preamble(),this.stackSlot=0,this.stackVars=[],this.aliases={},this.registers={list:[]},this.hashes=[],this.compileStack=[],this.inlineStack=[],this.compileChildren(a,b),this.useDepths=this.useDepths||a.depths.list.length||this.options.compat;var e,f,g,i=a.opcodes;for(f=0,g=i.length;g>f;f++)e=i[f],this[e.opcode].apply(this,e.args);if(this.pushSource(""),this.stackSlot||this.inlineStack.length||this.compileStack.length)throw new h("Compile completed with content left on stack");var j=this.createFunctionContext(d);if(this.isChild)return j;var k={compiler:this.compilerInfo(),main:j},l=this.context.programs;for(f=0,g=l.length;g>f;f++)l[f]&&(k[f]=l[f]);return this.environment.usePartial&&(k.usePartial=!0),this.options.data&&(k.useData=!0),this.useDepths&&(k.useDepths=!0),this.options.compat&&(k.compat=!0),d||(k.compiler=JSON.stringify(k.compiler),k=this.objectLiteral(k)),k},preamble:function(){this.lastContext=0,this.source=[]},createFunctionContext:function(a){var b="",c=this.stackVars.concat(this.registers.list);c.length>0&&(b+=", "+c.join(", "));for(var d in this.aliases)this.aliases.hasOwnProperty(d)&&(b+=", "+d+"="+this.aliases[d]);var e=["depth0","helpers","partials","data"];this.useDepths&&e.push("depths");var f=this.mergeSource(b);return a?(e.push(f),Function.apply(this,e)):"function("+e.join(",")+") {\n  "+f+"}"},mergeSource:function(a){for(var b,c,d="",e=!this.forceBuffer,f=0,g=this.source.length;g>f;f++){var h=this.source[f];h.appendToBuffer?b=b?b+"\n    + "+h.content:h.content:(b&&(d?d+="buffer += "+b+";\n  ":(c=!0,d=b+";\n  "),b=void 0),d+=h+"\n  ",this.environment.isSimple||(e=!1))}return e?(b||!d)&&(d+="return "+(b||'""')+";\n"):(a+=", buffer = "+(c?"":this.initializeBuffer()),d+=b?"return buffer + "+b+";\n":"return buffer;\n"),a&&(d="var "+a.substring(2)+(c?"":";\n  ")+d),d},blockValue:function(a){this.aliases.blockHelperMissing="helpers.blockHelperMissing";var b=[this.contextName(0)];this.setupParams(a,0,b);var c=this.popStack();b.splice(1,0,c),this.push("blockHelperMissing.call("+b.join(", ")+")")},ambiguousBlockValue:function(){this.aliases.blockHelperMissing="helpers.blockHelperMissing";var a=[this.contextName(0)];this.setupParams("",0,a,!0),this.flushInline();var b=this.topStack();a.splice(1,0,b),this.pushSource("if (!"+this.lastHelper+") { "+b+" = blockHelperMissing.call("+a.join(", ")+"); }")},appendContent:function(a){this.pendingContent&&(a=this.pendingContent+a),this.pendingContent=a},append:function(){this.flushInline();var a=this.popStack();this.pushSource("if ("+a+" != null) { "+this.appendToBuffer(a)+" }"),this.environment.isSimple&&this.pushSource("else { "+this.appendToBuffer("''")+" }")},appendEscaped:function(){this.aliases.escapeExpression="this.escapeExpression",this.pushSource(this.appendToBuffer("escapeExpression("+this.popStack()+")"))},getContext:function(a){this.lastContext=a},pushContext:function(){this.pushStackLiteral(this.contextName(this.lastContext))},lookupOnContext:function(a,b,c){var d=0,e=a.length;for(c||!this.options.compat||this.lastContext?this.pushContext():this.push(this.depthedLookup(a[d++]));e>d;d++)this.replaceStack(function(c){var e=this.nameLookup(c,a[d],"context");return b?" && "+e:" != null ? "+e+" : "+c})},lookupData:function(a,b){a?this.pushStackLiteral("this.data(data, "+a+")"):this.pushStackLiteral("data");for(var c=b.length,d=0;c>d;d++)this.replaceStack(function(a){return" && "+this.nameLookup(a,b[d],"data")})},resolvePossibleLambda:function(){this.aliases.lambda="this.lambda",this.push("lambda("+this.popStack()+", "+this.contextName(0)+")")},pushStringParam:function(a,b){this.pushContext(),this.pushString(b),"sexpr"!==b&&("string"==typeof a?this.pushString(a):this.pushStackLiteral(a))},emptyHash:function(){this.pushStackLiteral("{}"),this.trackIds&&this.push("{}"),this.stringParams&&(this.push("{}"),this.push("{}"))},pushHash:function(){this.hash&&this.hashes.push(this.hash),this.hash={values:[],types:[],contexts:[],ids:[]}},popHash:function(){var a=this.hash;this.hash=this.hashes.pop(),this.trackIds&&this.push("{"+a.ids.join(",")+"}"),this.stringParams&&(this.push("{"+a.contexts.join(",")+"}"),this.push("{"+a.types.join(",")+"}")),this.push("{\n    "+a.values.join(",\n    ")+"\n  }")},pushString:function(a){this.pushStackLiteral(this.quotedString(a))},push:function(a){return this.inlineStack.push(a),a},pushLiteral:function(a){this.pushStackLiteral(a)},pushProgram:function(a){null!=a?this.pushStackLiteral(this.programExpression(a)):this.pushStackLiteral(null)},invokeHelper:function(a,b,c){this.aliases.helperMissing="helpers.helperMissing";var d=this.popStack(),e=this.setupHelper(a,b),f=(c?e.name+" || ":"")+d+" || helperMissing";this.push("(("+f+").call("+e.callParams+"))")},invokeKnownHelper:function(a,b){var c=this.setupHelper(a,b);this.push(c.name+".call("+c.callParams+")")},invokeAmbiguous:function(a,b){this.aliases.functionType='"function"',this.aliases.helperMissing="helpers.helperMissing",this.useRegister("helper");var c=this.popStack();this.emptyHash();var d=this.setupHelper(0,a,b),e=this.lastHelper=this.nameLookup("helpers",a,"helper");this.push("((helper = (helper = "+e+" || "+c+") != null ? helper : helperMissing"+(d.paramsInit?"),("+d.paramsInit:"")+"),(typeof helper === functionType ? helper.call("+d.callParams+") : helper))")},invokePartial:function(a,b){var c=[this.nameLookup("partials",a,"partial"),"'"+b+"'","'"+a+"'",this.popStack(),this.popStack(),"helpers","partials"];this.options.data?c.push("data"):this.options.compat&&c.push("undefined"),this.options.compat&&c.push("depths"),this.push("this.invokePartial("+c.join(", ")+")")},assignToHash:function(a){var b,c,d,e=this.popStack();this.trackIds&&(d=this.popStack()),this.stringParams&&(c=this.popStack(),b=this.popStack());var f=this.hash;b&&f.contexts.push("'"+a+"': "+b),c&&f.types.push("'"+a+"': "+c),d&&f.ids.push("'"+a+"': "+d),f.values.push("'"+a+"': ("+e+")")},pushId:function(a,b){"ID"===a||"DATA"===a?this.pushString(b):"sexpr"===a?this.pushStackLiteral("true"):this.pushStackLiteral("null")},compiler:d,compileChildren:function(a,b){for(var c,d,e=a.children,f=0,g=e.length;g>f;f++){c=e[f],d=new this.compiler;var h=this.matchExistingProgram(c);null==h?(this.context.programs.push(""),h=this.context.programs.length,c.index=h,c.name="program"+h,this.context.programs[h]=d.compile(c,b,this.context,!this.precompile),this.context.environments[h]=c,this.useDepths=this.useDepths||d.useDepths):(c.index=h,c.name="program"+h)}},matchExistingProgram:function(a){for(var b=0,c=this.context.environments.length;c>b;b++){var d=this.context.environments[b];if(d&&d.equals(a))return b}},programExpression:function(a){var b=this.environment.children[a],c=(b.depths.list,this.useDepths),d=[b.index,"data"];return c&&d.push("depths"),"this.program("+d.join(", ")+")"},useRegister:function(a){this.registers[a]||(this.registers[a]=!0,this.registers.list.push(a))},pushStackLiteral:function(a){return this.push(new c(a))},pushSource:function(a){this.pendingContent&&(this.source.push(this.appendToBuffer(this.quotedString(this.pendingContent))),this.pendingContent=void 0),a&&this.source.push(a)},pushStack:function(a){this.flushInline();var b=this.incrStack();return this.pushSource(b+" = "+a+";"),this.compileStack.push(b),b},replaceStack:function(a){{var b,d,e,f="";this.isInline()}if(!this.isInline())throw new h("replaceStack on non-inline");var g=this.popStack(!0);if(g instanceof c)f=b=g.value,e=!0;else{d=!this.stackSlot;var i=d?this.incrStack():this.topStackName();f="("+this.push(i)+" = "+g+")",b=this.topStack()}var j=a.call(this,b);e||this.popStack(),d&&this.stackSlot--,this.push("("+f+j+")")},incrStack:function(){return this.stackSlot++,this.stackSlot>this.stackVars.length&&this.stackVars.push("stack"+this.stackSlot),this.topStackName()},topStackName:function(){return"stack"+this.stackSlot},flushInline:function(){var a=this.inlineStack;if(a.length){this.inlineStack=[];for(var b=0,d=a.length;d>b;b++){var e=a[b];e instanceof c?this.compileStack.push(e):this.pushStack(e)}}},isInline:function(){return this.inlineStack.length},popStack:function(a){var b=this.isInline(),d=(b?this.inlineStack:this.compileStack).pop();if(!a&&d instanceof c)return d.value;if(!b){if(!this.stackSlot)throw new h("Invalid stack pop");this.stackSlot--}return d},topStack:function(){var a=this.isInline()?this.inlineStack:this.compileStack,b=a[a.length-1];return b instanceof c?b.value:b},contextName:function(a){return this.useDepths&&a?"depths["+a+"]":"depth"+a},quotedString:function(a){return'"'+a.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029")+'"'},objectLiteral:function(a){var b=[];for(var c in a)a.hasOwnProperty(c)&&b.push(this.quotedString(c)+":"+a[c]);return"{"+b.join(",")+"}"},setupHelper:function(a,b,c){var d=[],e=this.setupParams(b,a,d,c),f=this.nameLookup("helpers",b,"helper");return{params:d,paramsInit:e,name:f,callParams:[this.contextName(0)].concat(d).join(", ")}},setupOptions:function(a,b,c){var d,e,f,g={},h=[],i=[],j=[];g.name=this.quotedString(a),g.hash=this.popStack(),this.trackIds&&(g.hashIds=this.popStack()),this.stringParams&&(g.hashTypes=this.popStack(),g.hashContexts=this.popStack()),e=this.popStack(),f=this.popStack(),(f||e)&&(f||(f="this.noop"),e||(e="this.noop"),g.fn=f,g.inverse=e);for(var k=b;k--;)d=this.popStack(),c[k]=d,this.trackIds&&(j[k]=this.popStack()),this.stringParams&&(i[k]=this.popStack(),h[k]=this.popStack());return this.trackIds&&(g.ids="["+j.join(",")+"]"),this.stringParams&&(g.types="["+i.join(",")+"]",g.contexts="["+h.join(",")+"]"),this.options.data&&(g.data="data"),g},setupParams:function(a,b,c,d){var e=this.objectLiteral(this.setupOptions(a,b,c));return d?(this.useRegister("options"),c.push("options"),"options="+e):(c.push(e),"")}};for(var i="break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public let yield".split(" "),j=d.RESERVED_WORDS={},k=0,l=i.length;l>k;k++)j[i[k]]=!0;return d.isValidJavaScriptVariableName=function(a){return!d.RESERVED_WORDS[a]&&/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(a)},e=d}(d,c),m=function(a,b,c,d,e){"use strict";var f,g=a,h=b,i=c.parser,j=c.parse,k=d.Compiler,l=d.compile,m=d.precompile,n=e,o=g.create,p=function(){var a=o();return a.compile=function(b,c){return l(b,c,a)},a.precompile=function(b,c){return m(b,c,a)},a.AST=h,a.Compiler=k,a.JavaScriptCompiler=n,a.Parser=i,a.parse=j,a};return g=p(),g.create=p,g["default"]=g,f=g}(f,g,j,k,l);return m});_.hb = Handlebars;
delete this.Handlebars;
})();
(function(){
!function(e,n){"use strict";function r(e,n){var r,t,u=e.toLowerCase();for(n=[].concat(n),r=0;n.length>r;r+=1)if(t=n[r]){if(t.test&&t.test(e))return!0;if(t.toLowerCase()===u)return!0}}var t=n.prototype.trim,u=n.prototype.trimRight,i=n.prototype.trimLeft,l=function(e){return 1*e||0},o=function(e,n){if(1>n)return"";for(var r="";n>0;)1&n&&(r+=e),n>>=1,e+=e;return r},a=[].slice,c=function(e){return null==e?"\\s":e.source?e.source:"["+g.escapeRegExp(e)+"]"},s={lt:"<",gt:">",quot:'"',amp:"&",apos:"'"},f={};for(var p in s)f[s[p]]=p;f["'"]="#39";var h=function(){function e(e){return Object.prototype.toString.call(e).slice(8,-1).toLowerCase()}var r=o,t=function(){return t.cache.hasOwnProperty(arguments[0])||(t.cache[arguments[0]]=t.parse(arguments[0])),t.format.call(null,t.cache[arguments[0]],arguments)};return t.format=function(t,u){var i,l,o,a,c,s,f,p=1,g=t.length,d="",m=[];for(l=0;g>l;l++)if(d=e(t[l]),"string"===d)m.push(t[l]);else if("array"===d){if(a=t[l],a[2])for(i=u[p],o=0;a[2].length>o;o++){if(!i.hasOwnProperty(a[2][o]))throw new Error(h('[_.sprintf] property "%s" does not exist',a[2][o]));i=i[a[2][o]]}else i=a[1]?u[a[1]]:u[p++];if(/[^s]/.test(a[8])&&"number"!=e(i))throw new Error(h("[_.sprintf] expecting number but found %s",e(i)));switch(a[8]){case"b":i=i.toString(2);break;case"c":i=n.fromCharCode(i);break;case"d":i=parseInt(i,10);break;case"e":i=a[7]?i.toExponential(a[7]):i.toExponential();break;case"f":i=a[7]?parseFloat(i).toFixed(a[7]):parseFloat(i);break;case"o":i=i.toString(8);break;case"s":i=(i=n(i))&&a[7]?i.substring(0,a[7]):i;break;case"u":i=Math.abs(i);break;case"x":i=i.toString(16);break;case"X":i=i.toString(16).toUpperCase()}i=/[def]/.test(a[8])&&a[3]&&i>=0?"+"+i:i,s=a[4]?"0"==a[4]?"0":a[4].charAt(1):" ",f=a[6]-n(i).length,c=a[6]?r(s,f):"",m.push(a[5]?i+c:c+i)}return m.join("")},t.cache={},t.parse=function(e){for(var n=e,r=[],t=[],u=0;n;){if(null!==(r=/^[^\x25]+/.exec(n)))t.push(r[0]);else if(null!==(r=/^\x25{2}/.exec(n)))t.push("%");else{if(null===(r=/^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(n)))throw new Error("[_.sprintf] huh?");if(r[2]){u|=1;var i=[],l=r[2],o=[];if(null===(o=/^([a-z_][a-z_\d]*)/i.exec(l)))throw new Error("[_.sprintf] huh?");for(i.push(o[1]);""!==(l=l.substring(o[0].length));)if(null!==(o=/^\.([a-z_][a-z_\d]*)/i.exec(l)))i.push(o[1]);else{if(null===(o=/^\[(\d+)\]/.exec(l)))throw new Error("[_.sprintf] huh?");i.push(o[1])}r[2]=i}else u|=2;if(3===u)throw new Error("[_.sprintf] mixing positional and named placeholders is not (yet) supported");t.push(r)}n=n.substring(r[0].length)}return t},t}(),g={VERSION:"2.3.0",isBlank:function(e){return null==e&&(e=""),/^\s*$/.test(e)},stripTags:function(e){return null==e?"":n(e).replace(/<\/?[^>]+>/g,"")},capitalize:function(e){return e=null==e?"":n(e),e.charAt(0).toUpperCase()+e.slice(1)},chop:function(e,r){return null==e?[]:(e=n(e),r=~~r,r>0?e.match(new RegExp(".{1,"+r+"}","g")):[e])},clean:function(e){return g.strip(e).replace(/\s+/g," ")},count:function(e,r){if(null==e||null==r)return 0;e=n(e),r=n(r);for(var t=0,u=0,i=r.length;;){if(u=e.indexOf(r,u),-1===u)break;t++,u+=i}return t},chars:function(e){return null==e?[]:n(e).split("")},swapCase:function(e){return null==e?"":n(e).replace(/\S/g,function(e){return e===e.toUpperCase()?e.toLowerCase():e.toUpperCase()})},escapeHTML:function(e){return null==e?"":n(e).replace(/[&<>"']/g,function(e){return"&"+f[e]+";"})},unescapeHTML:function(e){return null==e?"":n(e).replace(/\&([^;]+);/g,function(e,r){var t;return r in s?s[r]:(t=r.match(/^#x([\da-fA-F]+)$/))?n.fromCharCode(parseInt(t[1],16)):(t=r.match(/^#(\d+)$/))?n.fromCharCode(~~t[1]):e})},escapeRegExp:function(e){return null==e?"":n(e).replace(/([.*+?^=!:${}()|[\]\/\\])/g,"\\$1")},splice:function(e,n,r,t){var u=g.chars(e);return u.splice(~~n,~~r,t),u.join("")},insert:function(e,n,r){return g.splice(e,n,0,r)},include:function(e,r){return""===r?!0:null==e?!1:-1!==n(e).indexOf(r)},join:function(){var e=a.call(arguments),n=e.shift();return null==n&&(n=""),e.join(n)},lines:function(e){return null==e?[]:n(e).split("\n")},reverse:function(e){return g.chars(e).reverse().join("")},startsWith:function(e,r){return""===r?!0:null==e||null==r?!1:(e=n(e),r=n(r),e.length>=r.length&&e.slice(0,r.length)===r)},endsWith:function(e,r){return""===r?!0:null==e||null==r?!1:(e=n(e),r=n(r),e.length>=r.length&&e.slice(e.length-r.length)===r)},succ:function(e){return null==e?"":(e=n(e),e.slice(0,-1)+n.fromCharCode(e.charCodeAt(e.length-1)+1))},titleize:function(e){return null==e?"":(e=n(e).toLowerCase(),e.replace(/(?:^|\s|-)\S/g,function(e){return e.toUpperCase()}))},camelize:function(e){return g.trim(e).replace(/[-_\s]+(.)?/g,function(e,n){return n?n.toUpperCase():""})},underscored:function(e){return g.trim(e).replace(/([a-z\d])([A-Z]+)/g,"$1_$2").replace(/[-\s]+/g,"_").toLowerCase()},dasherize:function(e){return g.trim(e).replace(/([A-Z])/g,"-$1").replace(/[-_\s]+/g,"-").toLowerCase()},classify:function(e){return g.titleize(n(e).replace(/[\W_]/g," ")).replace(/\s/g,"")},humanize:function(e){return g.capitalize(g.underscored(e).replace(/_id$/,"").replace(/_/g," "))},trim:function(e,r){return null==e?"":!r&&t?t.call(e):(r=c(r),n(e).replace(new RegExp("^"+r+"+|"+r+"+$","g"),""))},ltrim:function(e,r){return null==e?"":!r&&i?i.call(e):(r=c(r),n(e).replace(new RegExp("^"+r+"+"),""))},rtrim:function(e,r){return null==e?"":!r&&u?u.call(e):(r=c(r),n(e).replace(new RegExp(r+"+$"),""))},truncate:function(e,r,t){return null==e?"":(e=n(e),t=t||"...",r=~~r,e.length>r?e.slice(0,r)+t:e)},prune:function(e,r,t){if(null==e)return"";if(e=n(e),r=~~r,t=null!=t?n(t):"...",r>=e.length)return e;var u=function(e){return e.toUpperCase()!==e.toLowerCase()?"A":" "},i=e.slice(0,r+1).replace(/.(?=\W*\w*$)/g,u);return i=i.slice(i.length-2).match(/\w\w/)?i.replace(/\s*\S+$/,""):g.rtrim(i.slice(0,i.length-1)),(i+t).length>e.length?e:e.slice(0,i.length)+t},words:function(e,n){return g.isBlank(e)?[]:g.trim(e,n).split(n||/\s+/)},pad:function(e,r,t,u){e=null==e?"":n(e),r=~~r;var i=0;switch(t?t.length>1&&(t=t.charAt(0)):t=" ",u){case"right":return i=r-e.length,e+o(t,i);case"both":return i=r-e.length,o(t,Math.ceil(i/2))+e+o(t,Math.floor(i/2));default:return i=r-e.length,o(t,i)+e}},lpad:function(e,n,r){return g.pad(e,n,r)},rpad:function(e,n,r){return g.pad(e,n,r,"right")},lrpad:function(e,n,r){return g.pad(e,n,r,"both")},sprintf:h,vsprintf:function(e,n){return n.unshift(e),h.apply(null,n)},toNumber:function(e,n){return e?(e=g.trim(e),e.match(/^-?\d+(?:\.\d+)?$/)?l(l(e).toFixed(~~n)):0/0):0},numberFormat:function(e,n,r,t){if(isNaN(e)||null==e)return"";e=e.toFixed(~~n),t="string"==typeof t?t:",";var u=e.split("."),i=u[0],l=u[1]?(r||".")+u[1]:"";return i.replace(/(\d)(?=(?:\d{3})+$)/g,"$1"+t)+l},strRight:function(e,r){if(null==e)return"";e=n(e),r=null!=r?n(r):r;var t=r?e.indexOf(r):-1;return~t?e.slice(t+r.length,e.length):e},strRightBack:function(e,r){if(null==e)return"";e=n(e),r=null!=r?n(r):r;var t=r?e.lastIndexOf(r):-1;return~t?e.slice(t+r.length,e.length):e},strLeft:function(e,r){if(null==e)return"";e=n(e),r=null!=r?n(r):r;var t=r?e.indexOf(r):-1;return~t?e.slice(0,t):e},strLeftBack:function(e,n){if(null==e)return"";e+="",n=null!=n?""+n:n;var r=e.lastIndexOf(n);return~r?e.slice(0,r):e},toSentence:function(e,n,r,t){n=n||", ",r=r||" and ";var u=e.slice(),i=u.pop();return e.length>2&&t&&(r=g.rtrim(n)+r),u.length?u.join(n)+r+i:i},toSentenceSerial:function(){var e=a.call(arguments);return e[3]=!0,g.toSentence.apply(g,e)},slugify:function(e){if(null==e)return"";var r="ąàáäâãåæăćęèéëêìíïîłńòóöôõøśșțùúüûñçżź",t="aaaaaaaaaceeeeeiiiilnoooooosstuuuunczz",u=new RegExp(c(r),"g");return e=n(e).toLowerCase().replace(u,function(e){var n=r.indexOf(e);return t.charAt(n)||"-"}),g.dasherize(e.replace(/[^\w\s-]/g,""))},surround:function(e,n){return[n,e,n].join("")},quote:function(e,n){return g.surround(e,n||'"')},unquote:function(e,n){return n=n||'"',e[0]===n&&e[e.length-1]===n?e.slice(1,e.length-1):e},exports:function(){var e={};for(var n in this)this.hasOwnProperty(n)&&!n.match(/^(?:include|contains|reverse)$/)&&(e[n]=this[n]);return e},repeat:function(e,r,t){if(null==e)return"";if(r=~~r,null==t)return o(n(e),r);for(var u=[];r>0;u[--r]=e);return u.join(t)},naturalCmp:function(e,r){if(e==r)return 0;if(!e)return-1;if(!r)return 1;for(var t=/(\.\d+)|(\d+)|(\D+)/g,u=n(e).toLowerCase().match(t),i=n(r).toLowerCase().match(t),l=Math.min(u.length,i.length),o=0;l>o;o++){var a=u[o],c=i[o];if(a!==c){var s=parseInt(a,10);if(!isNaN(s)){var f=parseInt(c,10);if(!isNaN(f)&&s-f)return s-f}return c>a?-1:1}}return u.length===i.length?u.length-i.length:r>e?-1:1},levenshtein:function(e,r){if(null==e&&null==r)return 0;if(null==e)return n(r).length;if(null==r)return n(e).length;e=n(e),r=n(r);for(var t,u,i=[],l=0;r.length>=l;l++)for(var o=0;e.length>=o;o++)u=l&&o?e.charAt(o-1)===r.charAt(l-1)?t:Math.min(i[o],i[o-1],t)+1:l+o,t=i[o],i[o]=u;return i.pop()},toBoolean:function(e,n,t){return"number"==typeof e&&(e=""+e),"string"!=typeof e?!!e:(e=g.trim(e),r(e,n||["true","1"])?!0:r(e,t||["false","0"])?!1:void 0)}};g.strip=g.trim,g.lstrip=g.ltrim,g.rstrip=g.rtrim,g.center=g.lrpad,g.rjust=g.lpad,g.ljust=g.rpad,g.contains=g.include,g.q=g.quote,g.toBool=g.toBoolean,"undefined"!=typeof exports&&("undefined"!=typeof module&&module.exports&&(module.exports=g),exports._s=g),"function"==typeof define&&define.amd&&define("underscore.string",[],function(){return g}),e._=e._||{},e._.string=e._.str=g}(this,String);})();
(
function (_){

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
    _.sorn = function(s){ 
        if(_.is_string(s) || _.is_number(s)){
            return(s + "");
        }else{
            return(null);
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

}
)(_);
_.log = (
function (_){

    function consoleTransport(log, logLevel, timestamp, entry){ 
        var writer = _.stdout;
        var priority = log.priority(logLevel);

        // error or worse
        if(priority > 3){ writer = _.stderr; }

        if(log.timestamp()){ writer(_.moment(timestamp).format("YYYY-MM-DD HH:MM:SS") + ":", entry); }
        else{ writer(entry); }
    }


    function logger(options){

        if(_.isString(options)){
            options = { namespace: options };
        }

        options = options || {};

        this._defaultLevel = "error";
        this._defaultVerboseLevel = "debug";

        if(options.ns && !options.namespace){ options.namespace = options.ns; }

        this._namespace = options.namespace ? options.namespace : "";
        this.timestamp(options.timestamp);

        if(options.parent){ 
            this._parent = options.parent;
            this._transports = [];
        }else{ 
            this._parent = null;
            this._transports = _.clone(this._defaultTransports);
        }

        if(options.level){ this.level(options.level); }
        if(options.verboseLevel){ this.verboseLevel(options.verboseLevel); }
    }

    logger.prototype._levels = ['debug', 'info', 'notice', 'warning', 'error', 'crit', 'alert', 'emerg'];
    logger.prototype._priorities = { 'debug' : 0, 'info' : 1, 'notice' : 2, 'warning' : 3, 'error' : 4, 'crit' : 5, 'alert' : 6, 'emerg' : 7 };

    logger.prototype.levels = function(){ return(this._levels); };
    logger.prototype.priorities = function(){ return(this._priorities); };

    logger.prototype.verbose = function(){
        return(this.priority(this.level()) <= this.priority(this.verboseLevel()));
    };

    logger.prototype.noop = function(){
        var self = this;
        if(!self._noop){  
            self._noop = self.make();
            self._noop._write = function(){};
            self._noop.make = function(){ return(self._noop); };
        }
        return(self._noop);
    };

    logger.prototype._defaultTransports = [consoleTransport];

    logger.prototype.transports = function(t){
        if(t){ this._transports = t; }
        else{ return(this._transports); }
    };

    logger.prototype.priority = function(level){ 
        if(level === undefined){
            return(this.priority(this.level()));
        }else if(this._priorities[level] !== undefined){
            return(this._priorities[level]);
        }else{
            return(-1); 
        }
    };

    logger.prototype.level = function(level){
        if(level !== undefined){
            if(this.priority(level) >= 0){ this._level = level; }
            return(this);
        }else{
            return(this.setting("_level", this._defaultLevel));
        }
    };

    logger.prototype.verboseLevel = function(level){
        if(level !== undefined){
            if(this.priority(level) >= 0){ this._verboseLevel = level; }
            return(this);
        }else{
            return(this.setting("_verboseLevel", this._defaultVerboseLevel));
        }
    };

    logger.prototype.namespace = function(ns){
        if(ns !== undefined){ this._namespace = ns; }

        var ns = "";

        if(this.parent()){ ns += this.parent().namespace(); }
        if(this._namespace){
            if(ns){ ns += "."; }
            ns += this._namespace;
        }

        return(ns);
    };

    logger.prototype._write = function(logLevel, pieces){ 

        var ns = this.namespace();
        if(ns){ ns += ": "; }
        pieces.unshift(ns);
        var entry = _.format.apply(null, pieces);

        this._transport(logLevel, entry);
    }

    logger.prototype._transport = function(logLevel, entry){
        var self = this;
        var ts = _.timestamp();

        _.each(this.transports(), function(f){
            if(_.isFunction(f.writeEntry)){
                f.writeEntry(self, logLevel, ts, entry);
            }else if(_.isFunction(f)){
                f(self, logLevel, ts, entry);
            }
        });

        if(this.parent()){ this.parent()._transport(logLevel, entry); }
    }

    logger.prototype.parent = function(){ 
        if(this._parent){ return(this._parent); }
        else{ return(null); }
    };

    function makeLogFunction(logLevel){
        return(function(){
            if(this.priority(this.level()) <= this.priority(logLevel)){
                this._write(logLevel, _.toArray(arguments));
            }
            return(this);
        });
    }

    _.each(logger.prototype._levels, function(logLevel){
        logger.prototype[logLevel] = makeLogFunction(logLevel);
    });

    // you can revert to parent settings by nulling out child settings
    logger.prototype.setting = function(setting, defaultValue){
        if(this[setting] !== undefined && this[setting] !== null){
            return(this[setting]);
        }else if(this.parent()){
            return(this.parent().setting(setting, defaultValue));
        }else{
            return(defaultValue);
        }
    };

    logger.prototype.timestamp = function(enable){
        if(enable !== undefined){
            this._timestamp = enable;
            return(this);
        }else{ 
            return(this.setting("_timestamp", false));
        }
    };

    logger.prototype.make = function(options){
        return(new logger(options));
    };

    logger.prototype.child = function(options){ 
        if(!options){ options = {}; }
        if(_.isString(options)){ options = { namespace: options }; }
        return(this.make(_.extend(options, { parent: this })));
    };

    logger.prototype.mixin = function(root, options){
        root = root || {};

        root.log = new logger(options);

        return(root.log);
    }

    return(logger.prototype.mixin());
}
)(_);
_.format = (
function library(_){

    // taken from the nodejs source
    var format = (function(){
        var formatRegExp = /%[sdj%]/g;
        return(function(f) {
            if (!isString(f)) {
                var objects = [];
                for (var i = 0; i < arguments.length; i++) {
                    objects.push(inspect(arguments[i]));
                }
                return objects.join(' ');
            }

            var i = 1;
            var args = arguments;
            var len = args.length;
            var str = String(f).replace(formatRegExp, function(x) {
                if (x === '%') return '%';
                if (i >= len) return x;
                switch (x) {
                    case '%s': return String(args[i++]);
                    case '%d': return Number(args[i++]);
                    case '%j':
                               try {
                                   return JSON.stringify(args[i++]);
                               } catch (_) {
                                   return '[Circular]';
                               }
                    default:
                               return x;
                }
            });
            for (var x = args[i]; i < len; x = args[++i]) {
                if (isNull(x) || !isObject(x)) {
                    str += '' + x;
                } else {
                    str += ' ' + inspect(x);
                }
            }
            return str;
        });

        /**
         * Echos the value of a value. Trys to print the value out
         * in the best way possible given the different types.
         *
         * @param {Object} obj The object to print out.
         * @param {Object} opts Optional options object that alters the output.
         */
        /* legacy: obj, showHidden, depth, colors*/
        function inspect(obj, opts) {
            // default options
            var ctx = {
                seen: [],
                stylize: stylizeNoColor
            };
            // legacy...
            if (arguments.length >= 3) ctx.depth = arguments[2];
            if (arguments.length >= 4) ctx.colors = arguments[3];
            if (isBoolean(opts)) {
                // legacy...
                ctx.showHidden = opts;
            } else if (opts) {
                // got an "options" object
                _extend(ctx, opts);
            }
            // set default options
            if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
            if (isUndefined(ctx.depth)) ctx.depth = 4;
            if (isUndefined(ctx.colors)) ctx.colors = false;
            if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
            if (ctx.colors) ctx.stylize = stylizeWithColor;
            return formatValue(ctx, obj, ctx.depth);
        }

        // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
        inspect.colors = {
            'bold' : [1, 22],
            'italic' : [3, 23],
            'underline' : [4, 24],
            'inverse' : [7, 27],
            'white' : [37, 39],
            'grey' : [90, 39],
            'black' : [30, 39],
            'blue' : [34, 39],
            'cyan' : [36, 39],
            'green' : [32, 39],
            'magenta' : [35, 39],
            'red' : [31, 39],
            'yellow' : [33, 39]
        };

        // Don't use 'blue' not visible on cmd.exe
        inspect.styles = {
            'special': 'cyan',
            'number': 'yellow',
            'boolean': 'yellow',
            'undefined': 'grey',
            'null': 'bold',
            'string': 'green',
            'date': 'magenta',
            // "name": intentionally not styling
            'regexp': 'red'
        };


        function stylizeWithColor(str, styleType) {
            var style = inspect.styles[styleType];

            if (style) {
                return '\u001b[' + inspect.colors[style][0] + 'm' + str +
                    '\u001b[' + inspect.colors[style][1] + 'm';
            } else {
                return str;
            }
        }


        function stylizeNoColor(str, styleType) {
            return str;
        }


        function arrayToHash(array) {
            var hash = {};

            array.forEach(function(val, idx) {
                hash[val] = true;
            });

            return hash;
        }


        function formatValue(ctx, value, recurseTimes) {
            // Provide a hook for user-specified inspect functions.
            // Check that value is an object with an inspect function on it
            if (ctx.customInspect &&
                    value &&
                    isFunction(value.inspect) &&
                    // Filter out the util module, it's inspect function is special
                    value.inspect !== exports.inspect &&
                    // Also filter out any prototype objects using the circular check.
                    !(value.constructor && value.constructor.prototype === value)) {
                        var ret = value.inspect(recurseTimes, ctx);
                        if (!isString(ret)) {
                            ret = formatValue(ctx, ret, recurseTimes);
                        }
                        return ret;
                    }

            // Primitive types cannot have properties
            var primitive = formatPrimitive(ctx, value);
            if (primitive) {
                return primitive;
            }

            // Look up the keys of the object.
            var keys = Object.keys(value);
            var visibleKeys = arrayToHash(keys);

            if (ctx.showHidden) {
                keys = Object.getOwnPropertyNames(value);
            }

            // This could be a boxed primitive (new String(), etc.), check valueOf()
            // NOTE: Avoid calling `valueOf` on `Date` instance because it will return
            // a number which, when object has some additional user-stored `keys`,
            // will be printed out.
            var formatted;
            var raw = value;
            try {
                // the .valueOf() call can fail for a multitude of reasons
                if (!isDate(value))
                    raw = value.valueOf();
            } catch (e) {
                // ignore...
            }

            if (isString(raw)) {
                // for boxed Strings, we have to remove the 0-n indexed entries,
                // since they just noisey up the output and are redundant
                keys = keys.filter(function(key) {
                    return !(key >= 0 && key < raw.length);
                });
            }

            // Some type of object without properties can be shortcutted.
            if (keys.length === 0) {
                if (isFunction(value)) {
                    var name = value.name ? ': ' + value.name : '';
                    return ctx.stylize('[Function' + name + ']', 'special');
                }
                if (isRegExp(value)) {
                    return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
                }
                if (isDate(value)) {
                    return ctx.stylize(Date.prototype.toString.call(value), 'date');
                }
                if (isError(value)) {
                    return formatError(value);
                }
                // now check the `raw` value to handle boxed primitives
                if (isString(raw)) {
                    formatted = formatPrimitiveNoColor(ctx, raw);
                    return ctx.stylize('[String: ' + formatted + ']', 'string');
                }
                if (isNumber(raw)) {
                    formatted = formatPrimitiveNoColor(ctx, raw);
                    return ctx.stylize('[Number: ' + formatted + ']', 'number');
                }
                if (isBoolean(raw)) {
                    formatted = formatPrimitiveNoColor(ctx, raw);
                    return ctx.stylize('[Boolean: ' + formatted + ']', 'boolean');
                }
            }

            var base = '', array = false, braces = ['{', '}'];

            // Make Array say that they are Array
            if (isArray(value)) {
                array = true;
                braces = ['[', ']'];
            }

            // Make functions say that they are functions
            if (isFunction(value)) {
                var n = value.name ? ': ' + value.name : '';
                base = ' [Function' + n + ']';
            }

            // Make RegExps say that they are RegExps
            if (isRegExp(value)) {
                base = ' ' + RegExp.prototype.toString.call(value);
            }

            // Make dates with properties first say the date
            if (isDate(value)) {
                base = ' ' + Date.prototype.toUTCString.call(value);
            }

            // Make error with message first say the error
            if (isError(value)) {
                base = ' ' + formatError(value);
            }

            // Make boxed primitive Strings look like such
            if (isString(raw)) {
                formatted = formatPrimitiveNoColor(ctx, raw);
                base = ' ' + '[String: ' + formatted + ']';
            }

            // Make boxed primitive Numbers look like such
            if (isNumber(raw)) {
                formatted = formatPrimitiveNoColor(ctx, raw);
                base = ' ' + '[Number: ' + formatted + ']';
            }

            // Make boxed primitive Booleans look like such
            if (isBoolean(raw)) {
                formatted = formatPrimitiveNoColor(ctx, raw);
                base = ' ' + '[Boolean: ' + formatted + ']';
            }

            if (keys.length === 0 && (!array || value.length == 0)) {
                return braces[0] + base + braces[1];
            }

            if (recurseTimes < 0) {
                if (isRegExp(value)) {
                    return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
                } else {
                    return ctx.stylize('[Object]', 'special');
                }
            }

            ctx.seen.push(value);

            var output;
            if (array) {
                output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
            } else {
                output = keys.map(function(key) {
                    return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
                });
            }

            ctx.seen.pop();

            return reduceToSingleString(output, base, braces);
        }


        function formatPrimitive(ctx, value) {
            if (isUndefined(value))
                return ctx.stylize('undefined', 'undefined');
            if (isString(value)) {
                var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                    .replace(/'/g, "\\'")
                    .replace(/\\"/g, '"') + '\'';
                return ctx.stylize(simple, 'string');
            }
            if (isNumber(value)) {
                // Format -0 as '-0'. Strict equality won't distinguish 0 from -0,
                // so instead we use the fact that 1 / -0 < 0 whereas 1 / 0 > 0 .
                if (value === 0 && 1 / value < 0)
                    return ctx.stylize('-0', 'number');
                return ctx.stylize('' + value, 'number');
            }
            if (isBoolean(value))
                return ctx.stylize('' + value, 'boolean');
            // For some reason typeof null is "object", so special case here.
            if (isNull(value))
                return ctx.stylize('null', 'null');
        }


        function formatPrimitiveNoColor(ctx, value) {
            var stylize = ctx.stylize;
            ctx.stylize = stylizeNoColor;
            var str = formatPrimitive(ctx, value);
            ctx.stylize = stylize;
            return str;
        }


        function formatError(value) {
            return '[' + Error.prototype.toString.call(value) + ']';
        }


        function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
            var output = [];
            for (var i = 0, l = value.length; i < l; ++i) {
                if (hasOwnProperty(value, String(i))) {
                    output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
                                String(i), true));
                } else {
                    output.push('');
                }
            }
            keys.forEach(function(key) {
                if (!key.match(/^\d+$/)) {
                    output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
                            key, true));
                }
            });
            return output;
        }


        function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
            var name, str, desc;
            desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
            if (desc.get) {
                if (desc.set) {
                    str = ctx.stylize('[Getter/Setter]', 'special');
                } else {
                    str = ctx.stylize('[Getter]', 'special');
                }
            } else {
                if (desc.set) {
                    str = ctx.stylize('[Setter]', 'special');
                }
            }
            if (!hasOwnProperty(visibleKeys, key)) {
                name = '[' + key + ']';
            }
            if (!str) {
                if (ctx.seen.indexOf(desc.value) < 0) {
                    if (isNull(recurseTimes)) {
                        str = formatValue(ctx, desc.value, null);
                    } else {
                        str = formatValue(ctx, desc.value, recurseTimes - 1);
                    }
                    if (str.indexOf('\n') > -1) {
                        if (array) {
                            str = str.split('\n').map(function(line) {
                                return '  ' + line;
                            }).join('\n').substr(2);
                        } else {
                            str = '\n' + str.split('\n').map(function(line) {
                                return '   ' + line;
                            }).join('\n');
                        }
                    }
                } else {
                    str = ctx.stylize('[Circular]', 'special');
                }
            }
            if (isUndefined(name)) {
                if (array && key.match(/^\d+$/)) {
                    return str;
                }
                name = JSON.stringify('' + key);
                if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                    name = name.substr(1, name.length - 2);
                    name = ctx.stylize(name, 'name');
                } else {
                    name = name.replace(/'/g, "\\'")
                        .replace(/\\"/g, '"')
                        .replace(/(^"|"$)/g, "'")
                        .replace(/\\\\/g, '\\');
                    name = ctx.stylize(name, 'string');
                }
            }

            return name + ': ' + str;
        }


        function reduceToSingleString(output, base, braces) {
            var length = output.reduce(function(prev, cur) {
                return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
            }, 0);

            if (length > 60) {
                return braces[0] +
                    (base === '' ? '' : base + '\n ') +
                    ' ' +
                    output.join(',\n  ') +
                    ' ' +
                    braces[1];
            }

            return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
        }


        // NOTE: These type checking functions intentionally don't use `instanceof`
        // because it is fragile and can be easily faked with `Object.create()`.
        function isArray(ar) {
            return Array.isArray(ar);
        }

        function isBoolean(arg) {
            return typeof arg === 'boolean';
        }

        function isNull(arg) {
            return arg === null;
        }

        function isNullOrUndefined(arg) {
            return arg == null;
        }

        function isNumber(arg) {
            return typeof arg === 'number';
        }

        function isString(arg) {
            return typeof arg === 'string';
        }

        function isSymbol(arg) {
            return typeof arg === 'symbol';
        }

        function isUndefined(arg) {
            return arg === void 0;
        }

        function isRegExp(re) {
            return isObject(re) && objectToString(re) === '[object RegExp]';
        }

        function isObject(arg) {
            return typeof arg === 'object' && arg !== null;
        }

        function isDate(d) {
            return isObject(d) && objectToString(d) === '[object Date]';
        }

        function isError(e) {
            return isObject(e) &&
                (objectToString(e) === '[object Error]' || e instanceof Error);
        }

        function isFunction(arg) {
            return typeof arg === 'function';
        }

        function isPrimitive(arg) {
            return arg === null ||
                typeof arg === 'boolean' ||
                typeof arg === 'number' ||
                typeof arg === 'string' ||
                typeof arg === 'symbol' ||  // ES6 symbol
                typeof arg === 'undefined';
        }

        function isBuffer(arg) {
            return arg instanceof Buffer;
        }

        function objectToString(o) {
            return Object.prototype.toString.call(o);
        }


        function pad(n) {
            return n < 10 ? '0' + n.toString(10) : n.toString(10);
        }


        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // 26 Feb 16:19:34
        function timestamp() {
            var d = new Date();
            var time = [pad(d.getHours()),
                pad(d.getMinutes()),
                pad(d.getSeconds())].join(':');
            return [d.getDate(), months[d.getMonth()], time].join(' ');
        }


        // log is just a thin wrapper to console.log that prepends a timestamp
        /*
        exports.log = function() {
            console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
        };
        */

        var _extend = function(origin, add) {
            // Don't do anything if add isn't an object
            if (!add || !isObject(add)) return origin;

            var keys = Object.keys(add);
            var i = keys.length;
            while (i--) {
                origin[keys[i]] = add[keys[i]];
            }
            return origin;
        };

        function hasOwnProperty(obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        }

    })();


    format.phoneNumber = format.phone_number = function(number, locale){
        if(!_.isString(number)){ return(number); }
        if(number.length === 10){
            return(number.substr(0, 3) + "-" + number.substr(3, 3) + "-" + number.substr(6, 4));
        }else if(number.length === 11){
            return(number.substr(0, 1) + "-" + number.substr(1, 3) + "-" + number.substr(4, 3) + "-" + number.substr(7, 4));
        }else{ return(number); }
    }

    format.library = library;

    return(format);
}
)(_);
_.uuid = (
function library(_){

     function uuid(len, radix) {
        // ported by Tom Robison

        /*
           Based on Math.uuid.js 1.4 by Robert Kieffer

           ----
           Copyright (c) 2008, Robert Kieffer
           All rights reserved.

           Redistribution and use in source and binary forms, with or without
           modification, are permitted provided that the following conditions are met:

         * Redistributions of source code must retain the above copyright notice,
         this list of conditions and the following disclaimer.
         * Redistributions in binary form must reproduce the above copyright
         notice, this list of conditions and the following disclaimer in the
         documentation and/or other materials provided with the distribution.
         * Neither the name of Robert Kieffer nor the names of its contributors
         may be used to endorse or promote products derived from this software
         without specific prior written permission.
         THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
         AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
         IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
         ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
         LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
         CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
         SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
         INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
         CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
         ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
         POSSIBILITY OF SUCH DAMAGE.

        */

        /*
         * Generate a random uuid.
         *
         * USAGE: uuid.uuid(length, radix)
         * length - the desired number of characters
         * radix - the number of allowable values for each character.
         *
         * EXAMPLES:
         * // No arguments - returns RFC4122, version 4 ID
         * >>> Math.uuid()
         * "92329D39-6F5C-4520-ABFC-AAB64544E172"
         *
         * // One argument - returns ID of the specified length
         * >>> Math.uuid(15) // 15 character ID (default base=62)
         * "VcydxgltxrVZSTV"
         *
         * // Two arguments - returns ID of the specified length, and radix. (Radix must be <= 62)
         * >>> Math.uuid(8, 2) // 8 character ID (base=2)
         * "01001010"
         * >>> Math.uuid(8, 10) // 8 character ID (base=10)
         * "47473046"
         * >>> Math.uuid(8, 16) // 8 character ID (base=16)
         * "098F4D35"
         */

        var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        var chars = CHARS, uuid = [], rnd = Math.random;
        radix = radix || chars.length;

        if (len) {
            // Compact form
            for (var i = 0; i < len; i++)
                uuid[i] = chars[0 | rnd()*radix];
        } else {
            // rfc4122, version 4 form
            var r;

            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            // Fill in random data. At i==19 set the high bits of clock sequence as
            // per rfc4122, sec. 4.1.5
            for (var i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | rnd()*16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r & 0xf];
                }
            }
        }

        return uuid.join('');
    };

    uuid.library = library;

    return(uuid);
}
)(_);
_.sha256 = (
function library(_){

    function sha256(msg, utf8encode) {
        var Sha256 = {};  // Sha256 namespace

        Sha256.ROTR = function(n, x) { return (x >>> n) | (x << (32-n)); }
        Sha256.Sigma0 = function(x) { return Sha256.ROTR(2,  x) ^ Sha256.ROTR(13, x) ^ Sha256.ROTR(22, x); }
        Sha256.Sigma1 = function(x) { return Sha256.ROTR(6,  x) ^ Sha256.ROTR(11, x) ^ Sha256.ROTR(25, x); }
        Sha256.sigma0 = function(x) { return Sha256.ROTR(7,  x) ^ Sha256.ROTR(18, x) ^ (x>>>3);  }
        Sha256.sigma1 = function(x) { return Sha256.ROTR(17, x) ^ Sha256.ROTR(19, x) ^ (x>>>10); }
        Sha256.Ch = function(x, y, z)  { return (x & y) ^ (~x & z); }
        Sha256.Maj = function(x, y, z) { return (x & y) ^ (x & z) ^ (y & z); }
        
        //
        // hexadecimal representation of a number 
        //   (note toString(16) is implementation-dependant, and  
        //   in IE returns signed numbers when used on full words)
        //
        Sha256.toHexStr = function(n) {
          var s="", v;
          for (var i=7; i>=0; i--) { v = (n>>>(i*4)) & 0xf; s += v.toString(16); }
          return s;
        }
        
        
        /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
        /*  Utf8 class: encode / decode between multi-byte Unicode characters and UTF-8 multiple          */
        /*              single-byte character encoding (c) Chris Veness 2002-2010                         */
        /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
        
        var Utf8 = {};  // Utf8 namespace
        
        /**
         * Encode multi-byte Unicode string into utf-8 multiple single-byte characters 
         * (BMP / basic multilingual plane only)
         *
         * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3 chars
         *
         * @param {String} strUni Unicode string to be encoded as UTF-8
         * @returns {String} encoded string
         */
        Utf8.encode = function(strUni) {
          // use regular expressions & String.replace callback function for better efficiency 
          // than procedural approaches
          var strUtf = strUni.replace(
              /[\u0080-\u07ff]/g,  // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
              function(c) { 
                var cc = c.charCodeAt(0);
                return String.fromCharCode(0xc0 | cc>>6, 0x80 | cc&0x3f); }
            );
          strUtf = strUtf.replace(
              /[\u0800-\uffff]/g,  // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
              function(c) { 
                var cc = c.charCodeAt(0); 
                return String.fromCharCode(0xe0 | cc>>12, 0x80 | cc>>6&0x3F, 0x80 | cc&0x3f); }
            );
          return strUtf;
        }
        
        /**
         * Decode utf-8 encoded string back into multi-byte Unicode characters
         *
         * @param {String} strUtf UTF-8 string to be decoded back to Unicode
         * @returns {String} decoded string
         */
        Utf8.decode = function(strUtf) {
          // note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
          var strUni = strUtf.replace(
              /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,  // 3-byte chars
              function(c) {  // (note parentheses for precence)
                var cc = ((c.charCodeAt(0)&0x0f)<<12) | ((c.charCodeAt(1)&0x3f)<<6) | ( c.charCodeAt(2)&0x3f); 
                return String.fromCharCode(cc); }
            );
          strUni = strUni.replace(
              /[\u00c0-\u00df][\u0080-\u00bf]/g,                 // 2-byte chars
              function(c) {  // (note parentheses for precence)
                var cc = (c.charCodeAt(0)&0x1f)<<6 | c.charCodeAt(1)&0x3f;
                return String.fromCharCode(cc); }
            );
          return strUni;
        }
        
        /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

        utf8encode =  (typeof utf8encode == 'undefined') ? true : utf8encode;
        
        // convert string to UTF-8, as SHA only deals with byte-streams
        if (utf8encode) msg = Utf8.encode(msg);
        
        // constants [§4.2.2]
        var K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
                 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
                 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
                 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
                 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
                 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
                 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
                 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
        // initial hash value [§5.3.1]
        var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

        // PREPROCESSING 
     
        msg += String.fromCharCode(0x80);  // add trailing '1' bit (+ 0's padding) to string [§5.1.1]

        // convert string msg into 512-bit/16-integer blocks arrays of ints [§5.2.1]
        var l = msg.length/4 + 2;  // length (in 32-bit integers) of msg + 1 + appended length
        var N = Math.ceil(l/16);   // number of 16-integer-blocks required to hold 'l' ints
        var M = new Array(N);

        for (var i=0; i<N; i++) {
            M[i] = new Array(16);
            for (var j=0; j<16; j++) {  // encode 4 chars per integer, big-endian encoding
                M[i][j] = (msg.charCodeAt(i*64+j*4)<<24) | (msg.charCodeAt(i*64+j*4+1)<<16) | 
                          (msg.charCodeAt(i*64+j*4+2)<<8) | (msg.charCodeAt(i*64+j*4+3));
            } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
        }
        // add length (in bits) into final pair of 32-bit integers (big-endian) [§5.1.1]
        // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
        // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
        M[N-1][14] = ((msg.length-1)*8) / Math.pow(2, 32); M[N-1][14] = Math.floor(M[N-1][14])
        M[N-1][15] = ((msg.length-1)*8) & 0xffffffff;


        // HASH COMPUTATION [§6.1.2]

        var W = new Array(64); var a, b, c, d, e, f, g, h;
        for (var i=0; i<N; i++) {

            // 1 - prepare message schedule 'W'
            for (var t=0;  t<16; t++) W[t] = M[i][t];
            for (var t=16; t<64; t++) W[t] = (Sha256.sigma1(W[t-2]) + W[t-7] + Sha256.sigma0(W[t-15]) + W[t-16]) & 0xffffffff;

            // 2 - initialise working variables a, b, c, d, e, f, g, h with previous hash value
            a = H[0]; b = H[1]; c = H[2]; d = H[3]; e = H[4]; f = H[5]; g = H[6]; h = H[7];

            // 3 - main loop (note 'addition modulo 2^32')
            for (var t=0; t<64; t++) {
                var T1 = h + Sha256.Sigma1(e) + Sha256.Ch(e, f, g) + K[t] + W[t];
                var T2 = Sha256.Sigma0(a) + Sha256.Maj(a, b, c);
                h = g;
                g = f;
                f = e;
                e = (d + T1) & 0xffffffff;
                d = c;
                c = b;
                b = a;
                a = (T1 + T2) & 0xffffffff;
            }
             // 4 - compute the new intermediate hash value (note 'addition modulo 2^32')
            H[0] = (H[0]+a) & 0xffffffff;
            H[1] = (H[1]+b) & 0xffffffff; 
            H[2] = (H[2]+c) & 0xffffffff; 
            H[3] = (H[3]+d) & 0xffffffff; 
            H[4] = (H[4]+e) & 0xffffffff;
            H[5] = (H[5]+f) & 0xffffffff;
            H[6] = (H[6]+g) & 0xffffffff; 
            H[7] = (H[7]+h) & 0xffffffff; 
        }

        return Sha256.toHexStr(H[0]) + Sha256.toHexStr(H[1]) + Sha256.toHexStr(H[2]) + Sha256.toHexStr(H[3]) + 
               Sha256.toHexStr(H[4]) + Sha256.toHexStr(H[5]) + Sha256.toHexStr(H[6]) + Sha256.toHexStr(H[7]);
    };

    sha256.library = library;

    return(sha256);
}
)(_);
_.string_builder = (
function library(_){

    var lib = {};

    function string_builder_class(){
        this._str = "";
        this._indent = 0;
    };

    string_builder_class.prototype.addLine = function(){
        this.add(this._indent, " ");
        this._str += _.toArray(arguments).join("") + "\n";
    };
    string_builder_class.prototype.add_line = string_builder_class.prototype.addLine;

    string_builder_class.prototype.add = function(num){
        var args = _.toArray(arguments);
        if(_.isNumber(num)){
            args.shift();
        }else{
            num = 1;
        }

        for(var i = 0; i < num; i++){
            this._str += args.join("");
        }
    }

    string_builder_class.prototype.in = function(num){ this._indent += num; };

    string_builder_class.prototype.out = function(num){ this._indent -= num; };

    string_builder_class.prototype.string = function(){ return(this._str); };

    function string_builder(){ return new string_builder_class(); }

    string_builder.library = library;
    string_builder.class = string_builder_class;

    return(string_builder);
}
)(_);
_.test = (
function library(_){

    var test = {};

    test.eq = function(actual, expected){
        if(_.deep_equal(actual, expected)){
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

    test.library = library;

    return(test);
}
)(_);
_.url = (
function library(_){

    var lib = {};

    lib.join = function(){
        var joined = [].slice.call(arguments, 0).join('/');
        return(lib.normalize(joined));
    }

    lib.normalize = function(str) {
        return(
            str
            .replace(/[\/]+/g, '/')
            .replace(/\/\?/g, '?')
            .replace(/\/\#/g, '#')
            .replace(/\:\//g, '://')
        );
    };

    lib.fun = function(root, base){
        if(!_.isString(root) && !_.isFunction(root)){
            throw(_.exception("BadRoot", "root is not a string or function."));
        }

        return(function(){
            var path = null;
            if(_.isString(root)){
                path = root;
            }else if(_.isFunction(root)){
                path = root.call(this);
            }

            if(base){ path = lib.join(path, base); }

            if(!arguments.length){
                return(path);
            }else{
                return(lib.join(path, lib.join.apply(null, arguments)));
            }
        });
    };

    // Copyright Joyent, Inc. and other Node contributors.
    //
    // Permission is hereby granted, free of charge, to any person obtaining a
    // copy of this software and associated documentation files (the
    // "Software"), to deal in the Software without restriction, including
    // without limitation the rights to use, copy, modify, merge, publish,
    // distribute, sublicense, and/or sell copies of the Software, and to permit
    // persons to whom the Software is furnished to do so, subject to the
    // following conditions:
    //
    // The above copyright notice and this permission notice shall be included
    // in all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
    // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
    // USE OR OTHER DEALINGS IN THE SOFTWARE.

    // var punycode = require('punycode');
    // util is only used for isNull, isFunction, isObject, etc.
    var util = _;

    lib.parse = urlParse;
    lib.resolve = urlResolve;
    lib.resolveObject = urlResolveObject;
    lib.format = urlFormat;

    lib.url = Url;

    function Url() {
      this.protocol = null;
      this.slashes = null;
      this.auth = null;
      this.host = null;
      this.port = null;
      this.hostname = null;
      this.hash = null;
      this.search = null;
      this.query = null;
      this.pathname = null;
      this.path = null;
      this.href = null;
    }

    // Reference: RFC 3986, RFC 1808, RFC 2396

    // define these here so at least they only have to be
    // compiled once on the first module load.
    var protocolPattern = /^([a-z0-9.+-]+:)/i,
        portPattern = /:[0-9]*$/,

        // Special case for a simple path URL
        simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

        // RFC 2396: characters reserved for delimiting URLs.
        // We actually just auto-escape these.
        delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

        // RFC 2396: characters not allowed for various reasons.
        unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

        // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
        autoEscape = ['\''].concat(unwise),
        // Characters that are never ever allowed in a hostname.
        // Note that any invalid chars are also handled, but these
        // are the ones that are *expected* to be seen, so we fast-path
        // them.
        nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
        hostEndingChars = ['/', '?', '#'],
        hostnameMaxLen = 255,
        hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
        hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
        // protocols that can allow "unsafe" and "unwise" chars.
        unsafeProtocol = {
          'javascript': true,
          'javascript:': true
        },
        // protocols that never have a hostname.
        hostlessProtocol = {
          'javascript': true,
          'javascript:': true
        },
        // protocols that always contain a // bit.
        slashedProtocol = {
          'http': true,
          'https': true,
          'ftp': true,
          'gopher': true,
          'file': true,
          'http:': true,
          'https:': true,
          'ftp:': true,
          'gopher:': true,
          'file:': true
        },
        querystring = _.querystring;

    function urlParse(url, parseQueryString, slashesDenoteHost) {
      if (url && util.isObject(url) && url instanceof Url) return url;

      var u = new Url;
      u.parse(url, parseQueryString, slashesDenoteHost);
      return u;
    }

    Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
      if (!util.isString(url)) {
        throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
      }

      // Copy chrome, IE, opera backslash-handling behavior.
      // See: https://code.google.com/p/chromium/issues/detail?id=25916
      var hashSplit = url.split('#');
      hashSplit[0] = hashSplit[0].replace(/\\/g, '/');
      url = hashSplit.join('#');

      var rest = url;

      // trim before proceeding.
      // This is to support parse stuff like "  http://foo.com  \n"
      rest = rest.trim();

      if (!slashesDenoteHost && hashSplit.length === 1) {
        // Try fast path regexp
        var simplePath = simplePathPattern.exec(rest);
        if (simplePath) {
          this.path = rest;
          this.href = rest;
          this.pathname = simplePath[1];
          if (simplePath[2]) {
            this.search = simplePath[2];
            if (parseQueryString) {
              this.query = querystring.parse(this.search.substr(1));
            } else {
              this.query = this.search.substr(1);
            }
          }
          return this;
        }
      }

      var proto = protocolPattern.exec(rest);
      if (proto) {
        proto = proto[0];
        var lowerProto = proto.toLowerCase();
        this.protocol = lowerProto;
        rest = rest.substr(proto.length);
      }

      // figure out if it's got a host
      // user@server is *always* interpreted as a hostname, and url
      // resolution will treat //foo/bar as host=foo,path=bar because that's
      // how the browser resolves relative URLs.
      if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
        var slashes = rest.substr(0, 2) === '//';
        if (slashes && !(proto && hostlessProtocol[proto])) {
          rest = rest.substr(2);
          this.slashes = true;
        }
      }

      if (!hostlessProtocol[proto] &&
          (slashes || (proto && !slashedProtocol[proto]))) {

        // there's a hostname.
        // the first instance of /, ?, ;, or # ends the host.
        //
        // If there is an @ in the hostname, then non-host chars *are* allowed
        // to the left of the last @ sign, unless some host-ending character
        // comes *before* the @-sign.
        // URLs are obnoxious.
        //
        // ex:
        // http://a@b@c/ => user:a@b host:c
        // http://a@b?@c => user:a host:c path:/?@c

        // v0.12 TODO(isaacs): This is not quite how Chrome does things.
        // Review our test case against browsers more comprehensively.

        // find the first instance of any hostEndingChars
        var hostEnd = -1;
        for (var i = 0; i < hostEndingChars.length; i++) {
          var hec = rest.indexOf(hostEndingChars[i]);
          if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
            hostEnd = hec;
        }

        // at this point, either we have an explicit point where the
        // auth portion cannot go past, or the last @ char is the decider.
        var auth, atSign;
        if (hostEnd === -1) {
          // atSign can be anywhere.
          atSign = rest.lastIndexOf('@');
        } else {
          // atSign must be in auth portion.
          // http://a@b/c@d => host:b auth:a path:/c@d
          atSign = rest.lastIndexOf('@', hostEnd);
        }

        // Now we have a portion which is definitely the auth.
        // Pull that off.
        if (atSign !== -1) {
          auth = rest.slice(0, atSign);
          rest = rest.slice(atSign + 1);
          this.auth = decodeURIComponent(auth);
        }

        // the host is the remaining to the left of the first non-host char
        hostEnd = -1;
        for (var i = 0; i < nonHostChars.length; i++) {
          var hec = rest.indexOf(nonHostChars[i]);
          if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
            hostEnd = hec;
        }
        // if we still have not hit it, then the entire thing is a host.
        if (hostEnd === -1)
          hostEnd = rest.length;

        this.host = rest.slice(0, hostEnd);
        rest = rest.slice(hostEnd);

        // pull out port.
        this.parseHost();

        // we've indicated that there is a hostname,
        // so even if it's empty, it has to be present.
        this.hostname = this.hostname || '';

        // if hostname begins with [ and ends with ]
        // assume that it's an IPv6 address.
        var ipv6Hostname = this.hostname[0] === '[' &&
            this.hostname[this.hostname.length - 1] === ']';

        // validate a little.
        if (!ipv6Hostname) {
          var hostparts = this.hostname.split(/\./);
          for (var i = 0, l = hostparts.length; i < l; i++) {
            var part = hostparts[i];
            if (!part) continue;
            if (!part.match(hostnamePartPattern)) {
              var newpart = '';
              for (var j = 0, k = part.length; j < k; j++) {
                if (part.charCodeAt(j) > 127) {
                  // we replace non-ASCII char with a temporary placeholder
                  // we need this to make sure size of hostname is not
                  // broken by replacing non-ASCII by nothing
                  newpart += 'x';
                } else {
                  newpart += part[j];
                }
              }
              // we test again with ASCII char only
              if (!newpart.match(hostnamePartPattern)) {
                var validParts = hostparts.slice(0, i);
                var notHost = hostparts.slice(i + 1);
                var bit = part.match(hostnamePartStart);
                if (bit) {
                  validParts.push(bit[1]);
                  notHost.unshift(bit[2]);
                }
                if (notHost.length) {
                  rest = '/' + notHost.join('.') + rest;
                }
                this.hostname = validParts.join('.');
                break;
              }
            }
          }
        }

        if (this.hostname.length > hostnameMaxLen) {
          this.hostname = '';
        } else {
          // hostnames are always lower case.
          this.hostname = this.hostname.toLowerCase();
        }

        /*
        if (!ipv6Hostname) {
          // IDNA Support: Returns a punycoded representation of "domain".
          // It only converts parts of the domain name that
          // have non-ASCII characters, i.e. it doesn't matter if
          // you call it with a domain that already is ASCII-only.
          this.hostname = punycode.toASCII(this.hostname);
        }
        */

        var p = this.port ? ':' + this.port : '';
        var h = this.hostname || '';
        this.host = h + p;
        this.href += this.host;

        // strip [ and ] from the hostname
        // the host field still retains them, though
        if (ipv6Hostname) {
          this.hostname = this.hostname.substr(1, this.hostname.length - 2);
          if (rest[0] !== '/') {
            rest = '/' + rest;
          }
        }
      }

      // now rest is set to the post-host stuff.
      // chop off any delim chars.
      if (!unsafeProtocol[lowerProto]) {

        // First, make 100% sure that any "autoEscape" chars get
        // escaped, even if encodeURIComponent doesn't think they
        // need to be.
        for (var i = 0, l = autoEscape.length; i < l; i++) {
          var ae = autoEscape[i];
          var esc = encodeURIComponent(ae);
          if (esc === ae) {
            esc = escape(ae);
          }
          rest = rest.split(ae).join(esc);
        }
      }


      // chop off from the tail first.
      var hash = rest.indexOf('#');
      if (hash !== -1) {
        // got a fragment string.
        this.hash = rest.substr(hash);
        rest = rest.slice(0, hash);
      }
      var qm = rest.indexOf('?');
      if (qm !== -1) {
        this.search = rest.substr(qm);
        this.query = rest.substr(qm + 1);
        if (parseQueryString) {
          this.query = querystring.parse(this.query);
        }
        rest = rest.slice(0, qm);
      } else if (parseQueryString) {
        // no query string, but parseQueryString still requested
        this.search = '';
        this.query = {};
      }
      if (rest) this.pathname = rest;
      if (slashedProtocol[lowerProto] &&
          this.hostname && !this.pathname) {
        this.pathname = '/';
      }

      //to support http.request
      if (this.pathname || this.search) {
        var p = this.pathname || '';
        var s = this.search || '';
        this.path = p + s;
      }

      // finally, reconstruct the href based on what has been validated.
      this.href = this.format();
      return this;
    };

    // format a parsed object into a url string
    function urlFormat(obj) {
      // ensure it's an object, and not a string url.
      // If it's an obj, this is a no-op.
      // this way, you can call url_format() on strings
      // to clean up potentially wonky urls.
      if (util.isString(obj)) obj = urlParse(obj);
      if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
      return obj.format();
    }

    Url.prototype.format = function() {
      var auth = this.auth || '';
      if (auth) {
        auth = encodeURIComponent(auth);
        auth = auth.replace(/%3A/i, ':');
        auth += '@';
      }

      var protocol = this.protocol || '',
          pathname = this.pathname || '',
          hash = this.hash || '',
          host = false,
          query = '';

      if (this.host) {
        host = auth + this.host;
      } else if (this.hostname) {
        host = auth + (this.hostname.indexOf(':') === -1 ?
            this.hostname :
            '[' + this.hostname + ']');
        if (this.port) {
          host += ':' + this.port;
        }
      }

      if (this.query &&
          util.isObject(this.query) &&
          Object.keys(this.query).length) {
        query = querystring.stringify(this.query);
      }

      var search = this.search || (query && ('?' + query)) || '';

      if (protocol && protocol.substr(-1) !== ':') protocol += ':';

      // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
      // unless they had them to begin with.
      if (this.slashes ||
          (!protocol || slashedProtocol[protocol]) && host !== false) {
        host = '//' + (host || '');
        if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
      } else if (!host) {
        host = '';
      }

      if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
      if (search && search.charAt(0) !== '?') search = '?' + search;

      pathname = pathname.replace(/[?#]/g, function(match) {
        return encodeURIComponent(match);
      });
      search = search.replace('#', '%23');

      return protocol + host + pathname + search + hash;
    };

    function urlResolve(source, relative) {
      return urlParse(source, false, true).resolve(relative);
    }

    Url.prototype.resolve = function(relative) {
      return this.resolveObject(urlParse(relative, false, true)).format();
    };

    function urlResolveObject(source, relative) {
      if (!source) return relative;
      return urlParse(source, false, true).resolveObject(relative);
    }

    Url.prototype.resolveObject = function(relative) {
      if (util.isString(relative)) {
        var rel = new Url();
        rel.parse(relative, false, true);
        relative = rel;
      }

      var result = new Url();
      var tkeys = Object.keys(this);
      for (var tk = 0; tk < tkeys.length; tk++) {
        var tkey = tkeys[tk];
        result[tkey] = this[tkey];
      }

      // hash is always overridden, no matter what.
      // even href="" will remove it.
      result.hash = relative.hash;

      // if the relative url is empty, then there's nothing left to do here.
      if (relative.href === '') {
        result.href = result.format();
        return result;
      }

      // hrefs like //foo/bar always cut to the protocol.
      if (relative.slashes && !relative.protocol) {
        // take everything except the protocol from relative
        var rkeys = Object.keys(relative);
        for (var rk = 0; rk < rkeys.length; rk++) {
          var rkey = rkeys[rk];
          if (rkey !== 'protocol')
            result[rkey] = relative[rkey];
        }

        //urlParse appends trailing / to urls like http://www.example.com
        if (slashedProtocol[result.protocol] &&
            result.hostname && !result.pathname) {
          result.path = result.pathname = '/';
        }

        result.href = result.format();
        return result;
      }

      if (relative.protocol && relative.protocol !== result.protocol) {
        // if it's a known url protocol, then changing
        // the protocol does weird things
        // first, if it's not file:, then we MUST have a host,
        // and if there was a path
        // to begin with, then we MUST have a path.
        // if it is file:, then the host is dropped,
        // because that's known to be hostless.
        // anything else is assumed to be absolute.
        if (!slashedProtocol[relative.protocol]) {
          var keys = Object.keys(relative);
          for (var v = 0; v < keys.length; v++) {
            var k = keys[v];
            result[k] = relative[k];
          }
          result.href = result.format();
          return result;
        }

        result.protocol = relative.protocol;
        if (!relative.host && !hostlessProtocol[relative.protocol]) {
          var relPath = (relative.pathname || '').split('/');
          while (relPath.length && !(relative.host = relPath.shift()));
          if (!relative.host) relative.host = '';
          if (!relative.hostname) relative.hostname = '';
          if (relPath[0] !== '') relPath.unshift('');
          if (relPath.length < 2) relPath.unshift('');
          result.pathname = relPath.join('/');
        } else {
          result.pathname = relative.pathname;
        }
        result.search = relative.search;
        result.query = relative.query;
        result.host = relative.host || '';
        result.auth = relative.auth;
        result.hostname = relative.hostname || relative.host;
        result.port = relative.port;
        // to support http.request
        if (result.pathname || result.search) {
          var p = result.pathname || '';
          var s = result.search || '';
          result.path = p + s;
        }
        result.slashes = result.slashes || relative.slashes;
        result.href = result.format();
        return result;
      }

      var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
          isRelAbs = (
              relative.host ||
              relative.pathname && relative.pathname.charAt(0) === '/'
          ),
          mustEndAbs = (isRelAbs || isSourceAbs ||
                        (result.host && relative.pathname)),
          removeAllDots = mustEndAbs,
          srcPath = result.pathname && result.pathname.split('/') || [],
          relPath = relative.pathname && relative.pathname.split('/') || [],
          psychotic = result.protocol && !slashedProtocol[result.protocol];

      // if the url is a non-slashed url, then relative
      // links like ../.. should be able
      // to crawl up to the hostname, as well.  This is strange.
      // result.protocol has already been set by now.
      // Later on, put the first path part into the host field.
      if (psychotic) {
        result.hostname = '';
        result.port = null;
        if (result.host) {
          if (srcPath[0] === '') srcPath[0] = result.host;
          else srcPath.unshift(result.host);
        }
        result.host = '';
        if (relative.protocol) {
          relative.hostname = null;
          relative.port = null;
          if (relative.host) {
            if (relPath[0] === '') relPath[0] = relative.host;
            else relPath.unshift(relative.host);
          }
          relative.host = null;
        }
        mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
      }

      if (isRelAbs) {
        // it's absolute.
        result.host = (relative.host || relative.host === '') ?
                      relative.host : result.host;
        result.hostname = (relative.hostname || relative.hostname === '') ?
                          relative.hostname : result.hostname;
        result.search = relative.search;
        result.query = relative.query;
        srcPath = relPath;
        // fall through to the dot-handling below.
      } else if (relPath.length) {
        // it's relative
        // throw away the existing file, and take the new path instead.
        if (!srcPath) srcPath = [];
        srcPath.pop();
        srcPath = srcPath.concat(relPath);
        result.search = relative.search;
        result.query = relative.query;
      } else if (!(util.isNull(relative.search) || util.isUndefined(relative.search))) {
        // just pull out the search.
        // like href='?foo'.
        // Put this after the other two cases because it simplifies the booleans
        if (psychotic) {
          result.hostname = result.host = srcPath.shift();
          //occationaly the auth can get stuck only in host
          //this especialy happens in cases like
          //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
          var authInHost = result.host && result.host.indexOf('@') > 0 ?
                           result.host.split('@') : false;
          if (authInHost) {
            result.auth = authInHost.shift();
            result.host = result.hostname = authInHost.shift();
          }
        }
        result.search = relative.search;
        result.query = relative.query;
        //to support http.request
        if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
          result.path = (result.pathname ? result.pathname : '') +
                        (result.search ? result.search : '');
        }
        result.href = result.format();
        return result;
      }

      if (!srcPath.length) {
        // no path at all.  easy.
        // we've already handled the other stuff above.
        result.pathname = null;
        //to support http.request
        if (result.search) {
          result.path = '/' + result.search;
        } else {
          result.path = null;
        }
        result.href = result.format();
        return result;
      }

      // if a url ENDs in . or .., then it must get a trailing slash.
      // however, if it ends in anything else non-slashy,
      // then it must NOT get a trailing slash.
      var last = srcPath.slice(-1)[0];
      var hasTrailingSlash = (
          (result.host || relative.host) && (last === '.' || last === '..') ||
          last === '');

      // strip single dots, resolve double dots to parent dir
      // if the path tries to go above the root, `up` ends up > 0
      var up = 0;
      for (var i = srcPath.length; i >= 0; i--) {
        last = srcPath[i];
        if (last === '.') {
          srcPath.splice(i, 1);
        } else if (last === '..') {
          srcPath.splice(i, 1);
          up++;
        } else if (up) {
          srcPath.splice(i, 1);
          up--;
        }
      }

      // if the path is allowed to go above the root, restore leading ..s
      if (!mustEndAbs && !removeAllDots) {
        for (; up--; up) {
          srcPath.unshift('..');
        }
      }

      if (mustEndAbs && srcPath[0] !== '' &&
          (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
        srcPath.unshift('');
      }

      if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
        srcPath.push('');
      }

      var isAbsolute = srcPath[0] === '' ||
          (srcPath[0] && srcPath[0].charAt(0) === '/');

      // put the host back
      if (psychotic) {
        result.hostname = result.host = isAbsolute ? '' :
                                        srcPath.length ? srcPath.shift() : '';
        //occationaly the auth can get stuck only in host
        //this especialy happens in cases like
        //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
        var authInHost = result.host && result.host.indexOf('@') > 0 ?
                         result.host.split('@') : false;
        if (authInHost) {
          result.auth = authInHost.shift();
          result.host = result.hostname = authInHost.shift();
        }
      }

      mustEndAbs = mustEndAbs || (result.host && srcPath.length);

      if (mustEndAbs && !isAbsolute) {
        srcPath.unshift('');
      }

      if (!srcPath.length) {
        result.pathname = null;
        result.path = null;
      } else {
        result.pathname = srcPath.join('/');
      }

      //to support request.http
      if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
        result.path = (result.pathname ? result.pathname : '') +
                      (result.search ? result.search : '');
      }
      result.auth = relative.auth || result.auth;
      result.slashes = result.slashes || relative.slashes;
      result.href = result.format();
      return result;
    };

    Url.prototype.parseHost = function() {
      var host = this.host;
      var port = portPattern.exec(host);
      if (port) {
        port = port[0];
        if (port !== ':') {
          this.port = port.substr(1);
        }
        host = host.substr(0, host.length - port.length);
      }
      if (host) this.hostname = host;
    };

    lib.library = library;

    return(lib);
}
)(_);
_.querystring = (
function library(_){
    
    var QueryString = {};
    // util is only used in this code for isFunction, isArray, etc
    var util = _;

    // If obj.hasOwnProperty has been overridden, then calling
    // obj.hasOwnProperty(prop) will break.
    // See: https://github.com/joyent/node/issues/1707
    function hasOwnProperty(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }


    function charCode(c) {
      return c.charCodeAt(0);
    }

    QueryString.unescape = function(s, decodeSpaces) {
        return decodeURIComponent(s);
    };


    QueryString.escape = function(str) {
      return encodeURIComponent(str);
    };

    var stringifyPrimitive = function(v) {
      if (util.isString(v))
        return v;
      if (util.isBoolean(v))
        return v ? 'true' : 'false';
      if (util.isNumber(v))
        return isFinite(v) ? v : '';
      return '';
    };


    QueryString.stringify = QueryString.encode = function(obj, sep, eq, options) {
      sep = sep || '&';
      eq = eq || '=';

      var encode = QueryString.escape;
      if (options && typeof options.encodeURIComponent === 'function') {
        encode = options.encodeURIComponent;
      }

      if (util.isObject(obj)) {
        var keys = Object.keys(obj);
        var fields = [];

        for (var i = 0; i < keys.length; i++) {
          var k = keys[i];
          var v = obj[k];
          var ks = encode(stringifyPrimitive(k)) + eq;

          if (util.isArray(v)) {
            for (var j = 0; j < v.length; j++)
              fields.push(ks + encode(stringifyPrimitive(v[j])));
          } else {
            fields.push(ks + encode(stringifyPrimitive(v)));
          }
        }
        return fields.join(sep);
      }
      return '';
    };

    // Parse a key=val string.
    QueryString.parse = QueryString.decode = function(qs, sep, eq, options) {
      sep = sep || '&';
      eq = eq || '=';
      var obj = {};

      if (!util.isString(qs) || qs.length === 0) {
        return obj;
      }

      var regexp = /\+/g;
      qs = qs.split(sep);

      var maxKeys = 1000;
      if (options && util.isNumber(options.maxKeys)) {
        maxKeys = options.maxKeys;
      }

      var len = qs.length;
      // maxKeys <= 0 means that we should not limit keys count
      if (maxKeys > 0 && len > maxKeys) {
        len = maxKeys;
      }

      var decode = QueryString.unescape;
      if (options && typeof options.decodeURIComponent === 'function') {
        decode = options.decodeURIComponent;
      }

      for (var i = 0; i < len; ++i) {
        var x = qs[i].replace(regexp, '%20'),
            idx = x.indexOf(eq),
            kstr, vstr, k, v;

        if (idx >= 0) {
          kstr = x.substr(0, idx);
          vstr = x.substr(idx + 1);
        } else {
          kstr = x;
          vstr = '';
        }

        try {
          k = decode(kstr);
          v = decode(vstr);
        } catch (e) {
          k = QueryString.unescape(kstr, true);
          v = QueryString.unescape(vstr, true);
        }

        if (!hasOwnProperty(obj, k)) {
          obj[k] = v;
        } else if (util.isArray(obj[k])) {
          obj[k].push(v);
        } else {
          obj[k] = [obj[k], v];
        }
      }

      return obj;
    };

    QueryString.library = library;
    return(QueryString);
}
)(_);
_.http_base = (
function library(_){

    function http_base(){ }

    http_base.prototype.make_call = function(options, method){

        var url = null;

        if(_.isString(options)){
            url = options;
            options = {};
        }else if(_.isObject(options)){
            url = options.url;
        }

        if(!url){ _.fatal("You must provide a url to connect to."); }
        if(!method){ _.fatal("You must provide a method (http verb)."); }

        // http spec, verbs are uppercase and case sensitive
        method = method.toUpperCase();

        var host = _.url.parse(url);
        var secure = (host.protocol && host.protocol === "https:") || host.port === 443;

        var headers = options.headers || {};

        if(!_.get(headers, "content-type")){ headers["content-type"] = "text/plain"; }

        var call = {
            url: url,
            secure: secure,
            host: host.hostname,
            port: host.port || (secure ? 443 : 80),
            path: host.pathname + (host.search ? host.search : ""),
            method: method,
            headers : headers,
        };


        return(call);
    };

    http_base.prototype.get = function(options, data, callback){

        if(_.isFunction(data)){
            callback = data;
            data = null;
        }

        if(data){
            var querystring = _.querystring.stringify(data);
            if(querystring){ querystring = "?" + querystring; }
            else{ querystring = ""; }

            if(_.isObject(options)){
                options.url = options.url + querystring;
            }else if(_.isString(options)){
                options = options + querystring;
            }
        }
 
        var call = this.make_call(options, "GET");

        return this.connect(call, "", callback);
    };

    http_base.prototype.post = function(options, data, callback){

        var use_writer = false;
        if(_.isFunction(data)){
            callback = data;
            data = null;
            use_writer = true;
        }

        var call = this.make_call(options, "POST");

        if(use_writer){
            return this.connect_writer(call, callback);
        }else{
            return this.connect(call, data, callback);
        }
    };

    http_base.prototype.connect = function(call, data, callback){

        callback = callback || _.noop;

        var writer = this.connect_writer(call, callback);

        if(data){ writer.write(data); }

        writer.end();
    };

    var lib = http_base;
    lib.library = library;

    return(lib);
}
)(_);
_.http = (
function library(){

    function request_manager(){
        _.http_base.call(this);
    }
    _.inherit(request_manager, _.http_base);

    function getXHR() {
        if (window.XMLHttpRequest && ('file:' != window.location.protocol || !window.ActiveXObject)) {
            return new XMLHttpRequest;
        } else {
            try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
            try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
            try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
            try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
        }
        return null;
    }

    request_manager.prototype.connect_writer = function(call, callback){
        var xhr = getXHR();

        xhr.onreadystatechange = function(){
            if (xhr.readyState !== 4){ return; }

            var client_response = {
                body: xhr.responseText,
                status: xhr.status
            };

            return callback(null, client_response, client_response.body);
        };

        var data = "";

        return({
            write: function(d){ data += d; },
            end: function(d){ 
                if(d !== undefined){ data += d; }
                xhr.open(call.method, call.url, true);
                _.each(call.headers, function(val, key){
                    xhr.setRequestHeader(key, val);
                });
                xhr.send(data);
            }
        });
    };

    var lib = new request_manager();
    lib.library = library;

    return(lib);
}
)(_);
(
function (_){

    _.stdout = function(){
        var entry = _.format.apply(null, arguments);
        console.log(entry);
    };

    _.stderr = function(){
        var entry = _.format.apply(null, arguments);
        console.log(entry);
    };

    _.p = _.stderr;
    
    _.nextTick = (function() {

        if(!window.postMessage && !window.addEventListener){
            return(function(f) { setTimeout(f, 0); });
        }else{

            var timeouts = [];
            var messageName = "zero-timeout-message";
        
            // Like setTimeout, but only takes a function argument.  There's
            // no time argument (always zero) and no arguments (you have to
            // use a closure).
            function nextTick(fn) {
                timeouts.push(fn);
                window.postMessage(messageName, "*");
            }
        
            function handleMessage(event) {
                if (event.source == window && event.data == messageName) {
                    event.stopPropagation();
                    if (timeouts.length > 0) {
                        var fn = timeouts.shift();
                        fn();
                    }
                }
            }
        
            window.addEventListener("message", handleMessage, true);

            return(nextTick);
        }

    })();

    _.client = {};

    _.client.labelOverInput = function(inputSelector, labelSelector){

        if(inputSelector === undefined){ _.fatal("need at least one selector for this to work."); }

        var parentSelector = "";
        if(labelSelector === undefined){
            parentSelector = inputSelector;
            inputSelector = "";
        }

        labelSelector = labelSelector || (parentSelector + " label");

        if(parentSelector){
            if($(parentSelector + " textarea").first()){
                inputSelector = parentSelector + " textarea";
            }

            if($(parentSelector + " input").first()){
                inputSelector = parentSelector + " input";
            }
        }

        $(labelSelector).click(function(e){
            $(inputSelector).focus();
        });

        $(inputSelector).focus(function(){
            $(labelSelector).hide();
        });

        $(inputSelector).blur(function(){
            if(!$(this).val()){ 
                $(labelSelector).show();
            }
        });
    };


    _.container = function(root){

        root.container = function(selector, change_callback){ 
            this._container_selector = selector;
            this._change_callback = change_callback;
            return(this);
        };

        root.show = function(flag){ 
            if(flag === false){ return this.hide.apply(this, _.concat(true, _.rest(arguments))); }
            if(this._container_selector){ 
                $(this._container_selector).removeClass("hide");
                if(this._change_callback){ 
                    this._change_callback.apply(null, _.concat(true, _.rest(arguments)));
                }
            }
        };

        root.hide = function(flag){ 
            if(flag === false){ return this.show.apply(this, _.concat(true, _.rest(arguments))); }
            if(this._container_selector){ 
                $(this._container_selector).addClass("hide");
                if(this._change_callback){ 
                    this._change_callback.apply(null, _.concat(false, _.rest(arguments)));
                }
            }
        };

        root.$ = function(selector, no_space){
            return($(this._container_selector + (no_space ? "" : " ") + (selector ? selector : "")));
        };
    };

    return(_);

}
)(_);
_.ns = (
function mixin(_){

    var ns = function(f, fname){

        fname = fname || "child";

        if(!f){ f = {}; }

        f[fname] = function(ns, val, cursor){ 

            if(_.isString(ns)){ ns = ns.split("."); }

            if(!cursor){ cursor = this; }
            if(!this._children){ this._children = {}; }

            var name = ns.shift();

            if(!ns.length){
                if(val !== undefined){ cursor[name] = val; }
                return(cursor[name]);
            }else{
                if(cursor[name] === undefined){
                    if(val === undefined){ return(cursor[name]); }
                    else{ cursor[name] = {}; }
                }
                return(f.child.call(this, ns, val, cursor[name]));
            }
        };

        return(f);
    };

    return(ns);
}
)(_);
_.hook = (
function (_){

var hooker = function(f){

    if(f === undefined){ f = {}; }
        
    f.hook_parent = _.rw("_hook_parent");

    f.hook = function(event, callback, is_error_handler){
        var self = this;
        if(!event || !callback){ _.fatal("You must provide an event name and a function."); }
        event = event.toLowerCase();
        if(self._hooks === undefined){ self._hooks = {}; }
        if(self._hooks[event] === undefined){ self._hooks[event] = []; }

        self._hooks[event].push({ handler: callback, is_error_handler: is_error_handler });
    };

    f.hooks = function(event){
        var hooks = [];
        var parent = this.hook_parent();
        if(parent){ hooks = parent.hooks(event); }

        if(this._hooks && this._hooks[event]){
            hooks = _.concat(hooks, this._hooks[event]);
        }

        return(hooks);
    };

    f.unhook = function(event, callback){
        var self = this;
        
        if(!self._hooks){ return; }
        
        if(!event || !callback){ _.fatal("You must provide an event name and a function."); }
        event = event.toLowerCase();

        if(self._hooks && self._hooks[event]){
            self._hooks[event] = _.filter(self._hooks[event], function(val){
                if(_.isFunction(callback)){
                    return(val.handler !== callback);                    
                }
            });
        }
    };

    f.bite = function(event, args, callback, timeout){
        var self = this;

        if(_.isFunction(args) && !callback){
            callback = args;
            args = [];
        }

        if(!_.isString(event) || !_.isFunction(callback)){
            _.fatal("You must provide an event name and a function.");
        }
        event = event.toLowerCase();
        
        var hooks = self.hooks(event);

        var error = null;
        _.each.async(hooks, function(val, key, next, end){
            // var to = _.timeout("Hook for event: " + event + " doesn't return in a timely manner, it probably forgot to call next.", 5000);

            if(error && !val.is_error_handler){ return next(); }

            function next_handler(err){

                if(error && !err){ error.swallowed = true; }
                else if(error && error !== err){ 
                    err.original = error;
                    err.rewritten = true;
                    error = err;
                }else if(err){ error = err; }

                next();
            }

            var handler = next_handler;
            if(timeout){ handler = _.timeout(next_handler, timeout); }

            var handler_args = _.concat(handler, args);
            if(val.is_error_handler){ handler_args.unshift(error); }

            val.handler.apply(null, handler_args);

        }, function(){
            if(error){ return callback(error); }
            else{ callback.apply(null, _.concat(null, args)); }
        });
    };
    
    return(f);
};

hooker.event_function = function(event){
    return(function(){
        var args = _.a(arguments);
        args.unshift(event);
        return(this.hook.apply(this, args));
    });
};

return(hooker);

}
)(_);
_.eventEmitter = (
function (_){

var eventEmitter = function(f){

    if(f === undefined){ f = {}; }
        
    f.on = function(event, tag, callback){
        var that = this;
        if(_.isFunction(tag)){
            callback = tag;
            tag = "";
        }
        if(!event || !callback){
            throw(new Error("You must provide an event name and a function."));
        }
        event = event.toLowerCase();
        if(that._events === undefined){ that._events = {}; }
        if(that._events[event] === undefined){ that._events[event] = []; }

        that._events[event].push({handler: callback, tag: tag});
    };

    f.addListener = f.on;

    f.off = function(event, callback){
        var that = this;
        
        if(!that._events){ return; }
        
        if(event){ event = event.toLowerCase(); }
        if(arguments.length === 0){
            that._events = {};
        }else if(arguments.length === 1){
            that._events[event] = [];
        }else{
            if(that._events && that._events[event]){
                that._events[event] = _.filter(that._events[event], function(val){
                    if(_.isFunction(callback)){
                        return(val.handler !== callback);                    
                    }else if(_.isString(callback)){
                        return(val.tag.toLowerCase() !== callback.toLowerCase());
                    }
                });
            }
        }
    };

    f.removeListener = f.off;

    f.once = function(event, callback){
        var that = this;
         
        function wrap() {
            that.off(event, wrap);
            callback.apply(this, arguments);
        };

        that.on(event, wrap);
    };

    f.emit = function(event){
        var that = this;
        var args = _.toArray(arguments);
        args.shift();
        
        if(!event){ throw(new Error("You must provide an event name.")); }
        event = event.toLowerCase();
        
        if(that._events && that._events[event]){
            _.each(that._events[event], function(val){
                val.handler.apply(null, args);
            });
        }
    };
    
    return(f);
};

return(eventEmitter);

}
)(_);
_.event_emitter = _.eventEmitter;
_.events = {};
_.eventEmitter(_.events);
_.measurer = (
function (_){

    // TODO: I need to refactor this, make it better.

    function measurer(options){

        options = options || {};

        this._parent = options.parent || null;
        this._transportsAsync = [];
        this._transportsSync = [this.runningTotalTransport];
    }

    measurer.prototype.parent = function(){ return(this._parent); };

    measurer.prototype.runningTotalTransport = function(measurement){
        var measurements = _.def(this, "_measurements", {});
        var category = _.def(measurements, measurement.category, {});
        var measurements = _.def(category, measurement.name, {});
        if(measurements[measurement.duration] === undefined){
            measurements[measurement.duration] = 0;
        }
        measurements[measurement.duration]++;
        measurements.last = measurement.duration;
    };

    measurer.prototype.transport = function(measurement){
        var self = this;

        _.each(this.transportsSync(), function(transport){ transport.call(self, measurement); });
        _.nextTick(function(){ _.each(self.transportsAsync(), function(transport){ transport.call(self, measurement); }); });

        if(this.parent()){ this.parent().transport(measurement); }
    };

    measurer.prototype.transportsSync = function(){ return(_.def(this, "_transportsSync", [])); };
    measurer.prototype.transportsAsync = function(){ return(_.def(this, "_transportsAsync", [])); };

    measurer.prototype.measure = function(categoryName, measurementName){
        var self = this;

        if(_.undef(categoryName) && _.undef(measurementName)){
            categoryName = "default";
            measurementName = _.uuid();
        }

        if(measurementName !== undefined || _.isObject(categoryName)){ 
            var stopped = self.stop(categoryName, measurementName);
            if(stopped){ return(stopped); }
            else{ return(self.start(categoryName, measurementName)); }
        }
    };
     
    measurer.prototype.child = function(options){
        return(new measurer(_.defaults(options, { parent: this })));
    };

    measurer.prototype.start = function(categoryName, measurementName){
        var pendingMeasurements = _.def(this, "_pendingMeasurements", {});
        var category = _.def(pendingMeasurements, categoryName, {});
        var measurements = _.def(category, measurementName, {});
        var newMeasurement = { type: 'measurement', category: categoryName, name: measurementName, token: _.uuid() };
        newMeasurement.start = _.timestamp();

        measurements[newMeasurement.token] = newMeasurement;
            
        return(newMeasurement);
    };

    measurer.prototype.stop = function(categoryName, measurementName){
        var self = this;
        var end = _.timestamp();
        var token = "";

        if(_.isObject(categoryName) && categoryName.type === 'measurement'){
            var tokenObj = categoryName;
            categoryName = tokenObj.category;
            measurementName = tokenObj.name;
            token = tokenObj.token;
        }

        var pendingMeasurements = _.def(this, "_pendingMeasurements", {});
        var category = _.def(pendingMeasurements, categoryName, {});
        var measurements = _.def(category, measurementName, {});
        
        var measurement = null;

        if(token){
            measurement = measurements[token];
            delete measurements[token];
        }else if(_.keys(measurements).length === 1){
            measurement = measurements[_.keys(measurements)[0]];
            delete measurements[_.keys(measurements)[0]];
        }

        // if(!measurement){ throw(_.exception("NoMeasurement", "No measurement found to stop.")); }

        if(measurement){
            measurement.end = end;
            measurement.duration = measurement.end - measurement.start;

            self.transport(measurement);

            return(measurement);

        }else{ return(null); }

    };

    measurer.prototype.measurements = function(categoryName, measurementName){
        var measurements = _.def(this, "_measurements", {})
        
        if(!categoryName){
            return(measurements);
        }else if(!measurementName){
            return(_.def(measurements, categoryName));
        }else{
            var category = _.def(measurements, categoryName);
            if(category){ return(_.def(category, measurementName)); }
            else{ return(undefined); }
        }
    };

    measurer.prototype.last = function(categoryName, measurementName){
        var measurements = _.def(this, "_measurements", {})
        var category = _.def(measurements, categoryName);
        
        if(!measurementName){
            var result = {};
            _.each(category, function(measurements, measurementName){
                result[measurementName] = measurements.last;
            });
            return(result);
        }else{
            if(category){ return(_.def(category, measurementName).last); }
            else{ return(undefined); }
        }
    };

    measurer.prototype.displayLast = function(categoryName, writer){
        writer = writer || _.stderr;
        var measurements = this.last(categoryName);

        var sorted = _.map(measurements, function(value, name){
            return({ value: value, name: name});
        });

        // sorted.sort(function(a, b){ return(a.value - b.value); });

        _.each(sorted, function(measurement){
            writer(measurement.name + ": " + measurement.value + "ms");
        });
    };

    measurer.prototype.make = function(root, options){
        root = root || {};

        root.measurer = new measurer(options);

        return(root.measurer);
    }

    return(new measurer());
}
)(_);
})();
