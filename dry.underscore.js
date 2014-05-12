(function(){
//     Underscore.js 1.6.0
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

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
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
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.6.0';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return obj;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (!_.isFunction(obj) && obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
    return obj;
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    any(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(predicate, context);
    each(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, function(value, index, list) {
      return !predicate.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, context);
    each(obj, function(value, index, list) {
      if (!(result = result && predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
    each(obj, function(value, index, list) {
      if (result || (result = predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
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

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    var result = -Infinity, lastComputed = -Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed > lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    var result = Infinity, lastComputed = Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed < lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Shuffle an array, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
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

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return value;
    return _.property(value);
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    iterator = lookupIterator(iterator);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
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
    return function(obj, iterator, context) {
      var result = {};
      iterator = lookupIterator(iterator);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    _.has(result, key) ? result[key].push(value) : result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
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
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    for (var i = 0, length = input.length; i < length; i++) {
      var value = input[i];
      if (!_.isArray(value) && !_.isArguments(value)) {
        if (!strict) output.push(value);
      } else if (shallow) {
        push.apply(output, value);
      } else {
        flatten(value, shallow, strict, output);
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Split an array into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = lookupIterator(predicate);
    var pass = [], fail = [];
    each(obj, function(elem) {
      (predicate.call(context, elem) ? pass : fail).push(elem);
    });
    return [pass, fail];
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (array == null) return [];
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var result = [];
    var seen = [];
    for (var i = 0, length = array.length; i < length; i++) {
      var value = array[i];
      if (iterator) value = iterator.call(context, value, i, array);
      if (isSorted ? (!i || seen !== value) : !_.contains(seen, value)) {
        if (isSorted) seen = value;
        else seen.push(value);
        result.push(array[i]);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true, []));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.contains(other, item);
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(slice.call(arguments, 1), true, true, []);
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, 'length').concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
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

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
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
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error('bindAll must be passed function names');
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
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
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        context = args = null;
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
      if (last < wait) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
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

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
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
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_isObject(obj)) return obj;
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
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
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
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
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
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  var _isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
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
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function () {
      return value;
    };
  };

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    return function(obj) {
      if (obj === attrs) return true;
      for (var key in attrs) {
        if (attrs[key] !== obj[key])
          return false;
      }
      return true;
    }
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
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
  _.now = Date.now || function() { return new Date().getTime(); };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
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
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

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
}).call(this);
(function(){
;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
  }

  if (require.aliases.hasOwnProperty(index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-indexof/index.js", function(exports, require, module){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("RedVentures-reduce/index.js", function(exports, require, module){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
});
require.register("superagent/lib/client.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    pairs.push(encodeURIComponent(key)
      + '=' + encodeURIComponent(obj[key]));
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(xhr, options) {
  options = options || {};
  this.xhr = xhr;
  this.text = xhr.responseText;
  this.setStatusProperties(xhr.status);
  this.header = this.headers = parseHeader(xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.parseBody(this.text);
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var msg = 'got ' + this.status + ' response';
  var err = new Error(msg);
  err.status = this.status;
  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.set('X-Requested-With', 'XMLHttpRequest');
  this.on('end', function(){
    var res = new Response(self.xhr);
    if ('HEAD' == method) res.text = null;
    self.callback(null, res);
  });
}

/**
 * Inherit from `Emitter.prototype`.
 */

Request.prototype = new Emitter;
Request.prototype.constructor = Request;

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._data;

  // store callback
  this._callback = fn || noop;

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

});
require.alias("component-emitter/index.js", "superagent/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("RedVentures-reduce/index.js", "superagent/deps/reduce/index.js");
require.alias("RedVentures-reduce/index.js", "reduce/index.js");

require.alias("superagent/lib/client.js", "superagent/index.js");

if (typeof exports == "object") {
  module.exports = require("superagent");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("superagent"); });
} else {
  this["superagent"] = require("superagent");
}})();})();
_.request = superagent;
delete this.superagent;
//! moment.js
//! version : 2.5.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
(function(a){function b(){return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1}}function c(a,b){return function(c){return k(a.call(this,c),b)}}function d(a,b){return function(c){return this.lang().ordinal(a.call(this,c),b)}}function e(){}function f(a){w(a),h(this,a)}function g(a){var b=q(a),c=b.year||0,d=b.month||0,e=b.week||0,f=b.day||0,g=b.hour||0,h=b.minute||0,i=b.second||0,j=b.millisecond||0;this._milliseconds=+j+1e3*i+6e4*h+36e5*g,this._days=+f+7*e,this._months=+d+12*c,this._data={},this._bubble()}function h(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c]);return b.hasOwnProperty("toString")&&(a.toString=b.toString),b.hasOwnProperty("valueOf")&&(a.valueOf=b.valueOf),a}function i(a){var b,c={};for(b in a)a.hasOwnProperty(b)&&qb.hasOwnProperty(b)&&(c[b]=a[b]);return c}function j(a){return 0>a?Math.ceil(a):Math.floor(a)}function k(a,b,c){for(var d=""+Math.abs(a),e=a>=0;d.length<b;)d="0"+d;return(e?c?"+":"":"-")+d}function l(a,b,c,d){var e,f,g=b._milliseconds,h=b._days,i=b._months;g&&a._d.setTime(+a._d+g*c),(h||i)&&(e=a.minute(),f=a.hour()),h&&a.date(a.date()+h*c),i&&a.month(a.month()+i*c),g&&!d&&db.updateOffset(a),(h||i)&&(a.minute(e),a.hour(f))}function m(a){return"[object Array]"===Object.prototype.toString.call(a)}function n(a){return"[object Date]"===Object.prototype.toString.call(a)||a instanceof Date}function o(a,b,c){var d,e=Math.min(a.length,b.length),f=Math.abs(a.length-b.length),g=0;for(d=0;e>d;d++)(c&&a[d]!==b[d]||!c&&s(a[d])!==s(b[d]))&&g++;return g+f}function p(a){if(a){var b=a.toLowerCase().replace(/(.)s$/,"$1");a=Tb[a]||Ub[b]||b}return a}function q(a){var b,c,d={};for(c in a)a.hasOwnProperty(c)&&(b=p(c),b&&(d[b]=a[c]));return d}function r(b){var c,d;if(0===b.indexOf("week"))c=7,d="day";else{if(0!==b.indexOf("month"))return;c=12,d="month"}db[b]=function(e,f){var g,h,i=db.fn._lang[b],j=[];if("number"==typeof e&&(f=e,e=a),h=function(a){var b=db().utc().set(d,a);return i.call(db.fn._lang,b,e||"")},null!=f)return h(f);for(g=0;c>g;g++)j.push(h(g));return j}}function s(a){var b=+a,c=0;return 0!==b&&isFinite(b)&&(c=b>=0?Math.floor(b):Math.ceil(b)),c}function t(a,b){return new Date(Date.UTC(a,b+1,0)).getUTCDate()}function u(a){return v(a)?366:365}function v(a){return a%4===0&&a%100!==0||a%400===0}function w(a){var b;a._a&&-2===a._pf.overflow&&(b=a._a[jb]<0||a._a[jb]>11?jb:a._a[kb]<1||a._a[kb]>t(a._a[ib],a._a[jb])?kb:a._a[lb]<0||a._a[lb]>23?lb:a._a[mb]<0||a._a[mb]>59?mb:a._a[nb]<0||a._a[nb]>59?nb:a._a[ob]<0||a._a[ob]>999?ob:-1,a._pf._overflowDayOfYear&&(ib>b||b>kb)&&(b=kb),a._pf.overflow=b)}function x(a){return null==a._isValid&&(a._isValid=!isNaN(a._d.getTime())&&a._pf.overflow<0&&!a._pf.empty&&!a._pf.invalidMonth&&!a._pf.nullInput&&!a._pf.invalidFormat&&!a._pf.userInvalidated,a._strict&&(a._isValid=a._isValid&&0===a._pf.charsLeftOver&&0===a._pf.unusedTokens.length)),a._isValid}function y(a){return a?a.toLowerCase().replace("_","-"):a}function z(a,b){return b._isUTC?db(a).zone(b._offset||0):db(a).local()}function A(a,b){return b.abbr=a,pb[a]||(pb[a]=new e),pb[a].set(b),pb[a]}function B(a){delete pb[a]}function C(a){var b,c,d,e,f=0,g=function(a){if(!pb[a]&&rb)try{require("./lang/"+a)}catch(b){}return pb[a]};if(!a)return db.fn._lang;if(!m(a)){if(c=g(a))return c;a=[a]}for(;f<a.length;){for(e=y(a[f]).split("-"),b=e.length,d=y(a[f+1]),d=d?d.split("-"):null;b>0;){if(c=g(e.slice(0,b).join("-")))return c;if(d&&d.length>=b&&o(e,d,!0)>=b-1)break;b--}f++}return db.fn._lang}function D(a){return a.match(/\[[\s\S]/)?a.replace(/^\[|\]$/g,""):a.replace(/\\/g,"")}function E(a){var b,c,d=a.match(vb);for(b=0,c=d.length;c>b;b++)d[b]=Yb[d[b]]?Yb[d[b]]:D(d[b]);return function(e){var f="";for(b=0;c>b;b++)f+=d[b]instanceof Function?d[b].call(e,a):d[b];return f}}function F(a,b){return a.isValid()?(b=G(b,a.lang()),Vb[b]||(Vb[b]=E(b)),Vb[b](a)):a.lang().invalidDate()}function G(a,b){function c(a){return b.longDateFormat(a)||a}var d=5;for(wb.lastIndex=0;d>=0&&wb.test(a);)a=a.replace(wb,c),wb.lastIndex=0,d-=1;return a}function H(a,b){var c,d=b._strict;switch(a){case"DDDD":return Ib;case"YYYY":case"GGGG":case"gggg":return d?Jb:zb;case"Y":case"G":case"g":return Lb;case"YYYYYY":case"YYYYY":case"GGGGG":case"ggggg":return d?Kb:Ab;case"S":if(d)return Gb;case"SS":if(d)return Hb;case"SSS":if(d)return Ib;case"DDD":return yb;case"MMM":case"MMMM":case"dd":case"ddd":case"dddd":return Cb;case"a":case"A":return C(b._l)._meridiemParse;case"X":return Fb;case"Z":case"ZZ":return Db;case"T":return Eb;case"SSSS":return Bb;case"MM":case"DD":case"YY":case"GG":case"gg":case"HH":case"hh":case"mm":case"ss":case"ww":case"WW":return d?Hb:xb;case"M":case"D":case"d":case"H":case"h":case"m":case"s":case"w":case"W":case"e":case"E":return xb;default:return c=new RegExp(P(O(a.replace("\\","")),"i"))}}function I(a){a=a||"";var b=a.match(Db)||[],c=b[b.length-1]||[],d=(c+"").match(Qb)||["-",0,0],e=+(60*d[1])+s(d[2]);return"+"===d[0]?-e:e}function J(a,b,c){var d,e=c._a;switch(a){case"M":case"MM":null!=b&&(e[jb]=s(b)-1);break;case"MMM":case"MMMM":d=C(c._l).monthsParse(b),null!=d?e[jb]=d:c._pf.invalidMonth=b;break;case"D":case"DD":null!=b&&(e[kb]=s(b));break;case"DDD":case"DDDD":null!=b&&(c._dayOfYear=s(b));break;case"YY":e[ib]=s(b)+(s(b)>68?1900:2e3);break;case"YYYY":case"YYYYY":case"YYYYYY":e[ib]=s(b);break;case"a":case"A":c._isPm=C(c._l).isPM(b);break;case"H":case"HH":case"h":case"hh":e[lb]=s(b);break;case"m":case"mm":e[mb]=s(b);break;case"s":case"ss":e[nb]=s(b);break;case"S":case"SS":case"SSS":case"SSSS":e[ob]=s(1e3*("0."+b));break;case"X":c._d=new Date(1e3*parseFloat(b));break;case"Z":case"ZZ":c._useUTC=!0,c._tzm=I(b);break;case"w":case"ww":case"W":case"WW":case"d":case"dd":case"ddd":case"dddd":case"e":case"E":a=a.substr(0,1);case"gg":case"gggg":case"GG":case"GGGG":case"GGGGG":a=a.substr(0,2),b&&(c._w=c._w||{},c._w[a]=b)}}function K(a){var b,c,d,e,f,g,h,i,j,k,l=[];if(!a._d){for(d=M(a),a._w&&null==a._a[kb]&&null==a._a[jb]&&(f=function(b){var c=parseInt(b,10);return b?b.length<3?c>68?1900+c:2e3+c:c:null==a._a[ib]?db().weekYear():a._a[ib]},g=a._w,null!=g.GG||null!=g.W||null!=g.E?h=Z(f(g.GG),g.W||1,g.E,4,1):(i=C(a._l),j=null!=g.d?V(g.d,i):null!=g.e?parseInt(g.e,10)+i._week.dow:0,k=parseInt(g.w,10)||1,null!=g.d&&j<i._week.dow&&k++,h=Z(f(g.gg),k,j,i._week.doy,i._week.dow)),a._a[ib]=h.year,a._dayOfYear=h.dayOfYear),a._dayOfYear&&(e=null==a._a[ib]?d[ib]:a._a[ib],a._dayOfYear>u(e)&&(a._pf._overflowDayOfYear=!0),c=U(e,0,a._dayOfYear),a._a[jb]=c.getUTCMonth(),a._a[kb]=c.getUTCDate()),b=0;3>b&&null==a._a[b];++b)a._a[b]=l[b]=d[b];for(;7>b;b++)a._a[b]=l[b]=null==a._a[b]?2===b?1:0:a._a[b];l[lb]+=s((a._tzm||0)/60),l[mb]+=s((a._tzm||0)%60),a._d=(a._useUTC?U:T).apply(null,l)}}function L(a){var b;a._d||(b=q(a._i),a._a=[b.year,b.month,b.day,b.hour,b.minute,b.second,b.millisecond],K(a))}function M(a){var b=new Date;return a._useUTC?[b.getUTCFullYear(),b.getUTCMonth(),b.getUTCDate()]:[b.getFullYear(),b.getMonth(),b.getDate()]}function N(a){a._a=[],a._pf.empty=!0;var b,c,d,e,f,g=C(a._l),h=""+a._i,i=h.length,j=0;for(d=G(a._f,g).match(vb)||[],b=0;b<d.length;b++)e=d[b],c=(h.match(H(e,a))||[])[0],c&&(f=h.substr(0,h.indexOf(c)),f.length>0&&a._pf.unusedInput.push(f),h=h.slice(h.indexOf(c)+c.length),j+=c.length),Yb[e]?(c?a._pf.empty=!1:a._pf.unusedTokens.push(e),J(e,c,a)):a._strict&&!c&&a._pf.unusedTokens.push(e);a._pf.charsLeftOver=i-j,h.length>0&&a._pf.unusedInput.push(h),a._isPm&&a._a[lb]<12&&(a._a[lb]+=12),a._isPm===!1&&12===a._a[lb]&&(a._a[lb]=0),K(a),w(a)}function O(a){return a.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(a,b,c,d,e){return b||c||d||e})}function P(a){return a.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function Q(a){var c,d,e,f,g;if(0===a._f.length)return a._pf.invalidFormat=!0,a._d=new Date(0/0),void 0;for(f=0;f<a._f.length;f++)g=0,c=h({},a),c._pf=b(),c._f=a._f[f],N(c),x(c)&&(g+=c._pf.charsLeftOver,g+=10*c._pf.unusedTokens.length,c._pf.score=g,(null==e||e>g)&&(e=g,d=c));h(a,d||c)}function R(a){var b,c,d=a._i,e=Mb.exec(d);if(e){for(a._pf.iso=!0,b=0,c=Ob.length;c>b;b++)if(Ob[b][1].exec(d)){a._f=Ob[b][0]+(e[6]||" ");break}for(b=0,c=Pb.length;c>b;b++)if(Pb[b][1].exec(d)){a._f+=Pb[b][0];break}d.match(Db)&&(a._f+="Z"),N(a)}else a._d=new Date(d)}function S(b){var c=b._i,d=sb.exec(c);c===a?b._d=new Date:d?b._d=new Date(+d[1]):"string"==typeof c?R(b):m(c)?(b._a=c.slice(0),K(b)):n(c)?b._d=new Date(+c):"object"==typeof c?L(b):b._d=new Date(c)}function T(a,b,c,d,e,f,g){var h=new Date(a,b,c,d,e,f,g);return 1970>a&&h.setFullYear(a),h}function U(a){var b=new Date(Date.UTC.apply(null,arguments));return 1970>a&&b.setUTCFullYear(a),b}function V(a,b){if("string"==typeof a)if(isNaN(a)){if(a=b.weekdaysParse(a),"number"!=typeof a)return null}else a=parseInt(a,10);return a}function W(a,b,c,d,e){return e.relativeTime(b||1,!!c,a,d)}function X(a,b,c){var d=hb(Math.abs(a)/1e3),e=hb(d/60),f=hb(e/60),g=hb(f/24),h=hb(g/365),i=45>d&&["s",d]||1===e&&["m"]||45>e&&["mm",e]||1===f&&["h"]||22>f&&["hh",f]||1===g&&["d"]||25>=g&&["dd",g]||45>=g&&["M"]||345>g&&["MM",hb(g/30)]||1===h&&["y"]||["yy",h];return i[2]=b,i[3]=a>0,i[4]=c,W.apply({},i)}function Y(a,b,c){var d,e=c-b,f=c-a.day();return f>e&&(f-=7),e-7>f&&(f+=7),d=db(a).add("d",f),{week:Math.ceil(d.dayOfYear()/7),year:d.year()}}function Z(a,b,c,d,e){var f,g,h=U(a,0,1).getUTCDay();return c=null!=c?c:e,f=e-h+(h>d?7:0)-(e>h?7:0),g=7*(b-1)+(c-e)+f+1,{year:g>0?a:a-1,dayOfYear:g>0?g:u(a-1)+g}}function $(a){var b=a._i,c=a._f;return null===b?db.invalid({nullInput:!0}):("string"==typeof b&&(a._i=b=C().preparse(b)),db.isMoment(b)?(a=i(b),a._d=new Date(+b._d)):c?m(c)?Q(a):N(a):S(a),new f(a))}function _(a,b){db.fn[a]=db.fn[a+"s"]=function(a){var c=this._isUTC?"UTC":"";return null!=a?(this._d["set"+c+b](a),db.updateOffset(this),this):this._d["get"+c+b]()}}function ab(a){db.duration.fn[a]=function(){return this._data[a]}}function bb(a,b){db.duration.fn["as"+a]=function(){return+this/b}}function cb(a){var b=!1,c=db;"undefined"==typeof ender&&(a?(gb.moment=function(){return!b&&console&&console.warn&&(b=!0,console.warn("Accessing Moment through the global scope is deprecated, and will be removed in an upcoming release.")),c.apply(null,arguments)},h(gb.moment,c)):gb.moment=db)}for(var db,eb,fb="2.5.1",gb=this,hb=Math.round,ib=0,jb=1,kb=2,lb=3,mb=4,nb=5,ob=6,pb={},qb={_isAMomentObject:null,_i:null,_f:null,_l:null,_strict:null,_isUTC:null,_offset:null,_pf:null,_lang:null},rb="undefined"!=typeof module&&module.exports&&"undefined"!=typeof require,sb=/^\/?Date\((\-?\d+)/i,tb=/(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,ub=/^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,vb=/(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g,wb=/(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,xb=/\d\d?/,yb=/\d{1,3}/,zb=/\d{1,4}/,Ab=/[+\-]?\d{1,6}/,Bb=/\d+/,Cb=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,Db=/Z|[\+\-]\d\d:?\d\d/gi,Eb=/T/i,Fb=/[\+\-]?\d+(\.\d{1,3})?/,Gb=/\d/,Hb=/\d\d/,Ib=/\d{3}/,Jb=/\d{4}/,Kb=/[+-]?\d{6}/,Lb=/[+-]?\d+/,Mb=/^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,Nb="YYYY-MM-DDTHH:mm:ssZ",Ob=[["YYYYYY-MM-DD",/[+-]\d{6}-\d{2}-\d{2}/],["YYYY-MM-DD",/\d{4}-\d{2}-\d{2}/],["GGGG-[W]WW-E",/\d{4}-W\d{2}-\d/],["GGGG-[W]WW",/\d{4}-W\d{2}/],["YYYY-DDD",/\d{4}-\d{3}/]],Pb=[["HH:mm:ss.SSSS",/(T| )\d\d:\d\d:\d\d\.\d{1,3}/],["HH:mm:ss",/(T| )\d\d:\d\d:\d\d/],["HH:mm",/(T| )\d\d:\d\d/],["HH",/(T| )\d\d/]],Qb=/([\+\-]|\d\d)/gi,Rb="Date|Hours|Minutes|Seconds|Milliseconds".split("|"),Sb={Milliseconds:1,Seconds:1e3,Minutes:6e4,Hours:36e5,Days:864e5,Months:2592e6,Years:31536e6},Tb={ms:"millisecond",s:"second",m:"minute",h:"hour",d:"day",D:"date",w:"week",W:"isoWeek",M:"month",y:"year",DDD:"dayOfYear",e:"weekday",E:"isoWeekday",gg:"weekYear",GG:"isoWeekYear"},Ub={dayofyear:"dayOfYear",isoweekday:"isoWeekday",isoweek:"isoWeek",weekyear:"weekYear",isoweekyear:"isoWeekYear"},Vb={},Wb="DDD w W M D d".split(" "),Xb="M D H h m s w W".split(" "),Yb={M:function(){return this.month()+1},MMM:function(a){return this.lang().monthsShort(this,a)},MMMM:function(a){return this.lang().months(this,a)},D:function(){return this.date()},DDD:function(){return this.dayOfYear()},d:function(){return this.day()},dd:function(a){return this.lang().weekdaysMin(this,a)},ddd:function(a){return this.lang().weekdaysShort(this,a)},dddd:function(a){return this.lang().weekdays(this,a)},w:function(){return this.week()},W:function(){return this.isoWeek()},YY:function(){return k(this.year()%100,2)},YYYY:function(){return k(this.year(),4)},YYYYY:function(){return k(this.year(),5)},YYYYYY:function(){var a=this.year(),b=a>=0?"+":"-";return b+k(Math.abs(a),6)},gg:function(){return k(this.weekYear()%100,2)},gggg:function(){return k(this.weekYear(),4)},ggggg:function(){return k(this.weekYear(),5)},GG:function(){return k(this.isoWeekYear()%100,2)},GGGG:function(){return k(this.isoWeekYear(),4)},GGGGG:function(){return k(this.isoWeekYear(),5)},e:function(){return this.weekday()},E:function(){return this.isoWeekday()},a:function(){return this.lang().meridiem(this.hours(),this.minutes(),!0)},A:function(){return this.lang().meridiem(this.hours(),this.minutes(),!1)},H:function(){return this.hours()},h:function(){return this.hours()%12||12},m:function(){return this.minutes()},s:function(){return this.seconds()},S:function(){return s(this.milliseconds()/100)},SS:function(){return k(s(this.milliseconds()/10),2)},SSS:function(){return k(this.milliseconds(),3)},SSSS:function(){return k(this.milliseconds(),3)},Z:function(){var a=-this.zone(),b="+";return 0>a&&(a=-a,b="-"),b+k(s(a/60),2)+":"+k(s(a)%60,2)},ZZ:function(){var a=-this.zone(),b="+";return 0>a&&(a=-a,b="-"),b+k(s(a/60),2)+k(s(a)%60,2)},z:function(){return this.zoneAbbr()},zz:function(){return this.zoneName()},X:function(){return this.unix()},Q:function(){return this.quarter()}},Zb=["months","monthsShort","weekdays","weekdaysShort","weekdaysMin"];Wb.length;)eb=Wb.pop(),Yb[eb+"o"]=d(Yb[eb],eb);for(;Xb.length;)eb=Xb.pop(),Yb[eb+eb]=c(Yb[eb],2);for(Yb.DDDD=c(Yb.DDD,3),h(e.prototype,{set:function(a){var b,c;for(c in a)b=a[c],"function"==typeof b?this[c]=b:this["_"+c]=b},_months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),months:function(a){return this._months[a.month()]},_monthsShort:"Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),monthsShort:function(a){return this._monthsShort[a.month()]},monthsParse:function(a){var b,c,d;for(this._monthsParse||(this._monthsParse=[]),b=0;12>b;b++)if(this._monthsParse[b]||(c=db.utc([2e3,b]),d="^"+this.months(c,"")+"|^"+this.monthsShort(c,""),this._monthsParse[b]=new RegExp(d.replace(".",""),"i")),this._monthsParse[b].test(a))return b},_weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),weekdays:function(a){return this._weekdays[a.day()]},_weekdaysShort:"Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),weekdaysShort:function(a){return this._weekdaysShort[a.day()]},_weekdaysMin:"Su_Mo_Tu_We_Th_Fr_Sa".split("_"),weekdaysMin:function(a){return this._weekdaysMin[a.day()]},weekdaysParse:function(a){var b,c,d;for(this._weekdaysParse||(this._weekdaysParse=[]),b=0;7>b;b++)if(this._weekdaysParse[b]||(c=db([2e3,1]).day(b),d="^"+this.weekdays(c,"")+"|^"+this.weekdaysShort(c,"")+"|^"+this.weekdaysMin(c,""),this._weekdaysParse[b]=new RegExp(d.replace(".",""),"i")),this._weekdaysParse[b].test(a))return b},_longDateFormat:{LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D YYYY",LLL:"MMMM D YYYY LT",LLLL:"dddd, MMMM D YYYY LT"},longDateFormat:function(a){var b=this._longDateFormat[a];return!b&&this._longDateFormat[a.toUpperCase()]&&(b=this._longDateFormat[a.toUpperCase()].replace(/MMMM|MM|DD|dddd/g,function(a){return a.slice(1)}),this._longDateFormat[a]=b),b},isPM:function(a){return"p"===(a+"").toLowerCase().charAt(0)},_meridiemParse:/[ap]\.?m?\.?/i,meridiem:function(a,b,c){return a>11?c?"pm":"PM":c?"am":"AM"},_calendar:{sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},calendar:function(a,b){var c=this._calendar[a];return"function"==typeof c?c.apply(b):c},_relativeTime:{future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},relativeTime:function(a,b,c,d){var e=this._relativeTime[c];return"function"==typeof e?e(a,b,c,d):e.replace(/%d/i,a)},pastFuture:function(a,b){var c=this._relativeTime[a>0?"future":"past"];return"function"==typeof c?c(b):c.replace(/%s/i,b)},ordinal:function(a){return this._ordinal.replace("%d",a)},_ordinal:"%d",preparse:function(a){return a},postformat:function(a){return a},week:function(a){return Y(a,this._week.dow,this._week.doy).week},_week:{dow:0,doy:6},_invalidDate:"Invalid date",invalidDate:function(){return this._invalidDate}}),db=function(c,d,e,f){var g;return"boolean"==typeof e&&(f=e,e=a),g={},g._isAMomentObject=!0,g._i=c,g._f=d,g._l=e,g._strict=f,g._isUTC=!1,g._pf=b(),$(g)},db.utc=function(c,d,e,f){var g;return"boolean"==typeof e&&(f=e,e=a),g={},g._isAMomentObject=!0,g._useUTC=!0,g._isUTC=!0,g._l=e,g._i=c,g._f=d,g._strict=f,g._pf=b(),$(g).utc()},db.unix=function(a){return db(1e3*a)},db.duration=function(a,b){var c,d,e,f=a,h=null;return db.isDuration(a)?f={ms:a._milliseconds,d:a._days,M:a._months}:"number"==typeof a?(f={},b?f[b]=a:f.milliseconds=a):(h=tb.exec(a))?(c="-"===h[1]?-1:1,f={y:0,d:s(h[kb])*c,h:s(h[lb])*c,m:s(h[mb])*c,s:s(h[nb])*c,ms:s(h[ob])*c}):(h=ub.exec(a))&&(c="-"===h[1]?-1:1,e=function(a){var b=a&&parseFloat(a.replace(",","."));return(isNaN(b)?0:b)*c},f={y:e(h[2]),M:e(h[3]),d:e(h[4]),h:e(h[5]),m:e(h[6]),s:e(h[7]),w:e(h[8])}),d=new g(f),db.isDuration(a)&&a.hasOwnProperty("_lang")&&(d._lang=a._lang),d},db.version=fb,db.defaultFormat=Nb,db.updateOffset=function(){},db.lang=function(a,b){var c;return a?(b?A(y(a),b):null===b?(B(a),a="en"):pb[a]||C(a),c=db.duration.fn._lang=db.fn._lang=C(a),c._abbr):db.fn._lang._abbr},db.langData=function(a){return a&&a._lang&&a._lang._abbr&&(a=a._lang._abbr),C(a)},db.isMoment=function(a){return a instanceof f||null!=a&&a.hasOwnProperty("_isAMomentObject")},db.isDuration=function(a){return a instanceof g},eb=Zb.length-1;eb>=0;--eb)r(Zb[eb]);for(db.normalizeUnits=function(a){return p(a)},db.invalid=function(a){var b=db.utc(0/0);return null!=a?h(b._pf,a):b._pf.userInvalidated=!0,b},db.parseZone=function(a){return db(a).parseZone()},h(db.fn=f.prototype,{clone:function(){return db(this)},valueOf:function(){return+this._d+6e4*(this._offset||0)},unix:function(){return Math.floor(+this/1e3)},toString:function(){return this.clone().lang("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")},toDate:function(){return this._offset?new Date(+this):this._d},toISOString:function(){var a=db(this).utc();return 0<a.year()&&a.year()<=9999?F(a,"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]"):F(a,"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]")},toArray:function(){var a=this;return[a.year(),a.month(),a.date(),a.hours(),a.minutes(),a.seconds(),a.milliseconds()]},isValid:function(){return x(this)},isDSTShifted:function(){return this._a?this.isValid()&&o(this._a,(this._isUTC?db.utc(this._a):db(this._a)).toArray())>0:!1},parsingFlags:function(){return h({},this._pf)},invalidAt:function(){return this._pf.overflow},utc:function(){return this.zone(0)},local:function(){return this.zone(0),this._isUTC=!1,this},format:function(a){var b=F(this,a||db.defaultFormat);return this.lang().postformat(b)},add:function(a,b){var c;return c="string"==typeof a?db.duration(+b,a):db.duration(a,b),l(this,c,1),this},subtract:function(a,b){var c;return c="string"==typeof a?db.duration(+b,a):db.duration(a,b),l(this,c,-1),this},diff:function(a,b,c){var d,e,f=z(a,this),g=6e4*(this.zone()-f.zone());return b=p(b),"year"===b||"month"===b?(d=432e5*(this.daysInMonth()+f.daysInMonth()),e=12*(this.year()-f.year())+(this.month()-f.month()),e+=(this-db(this).startOf("month")-(f-db(f).startOf("month")))/d,e-=6e4*(this.zone()-db(this).startOf("month").zone()-(f.zone()-db(f).startOf("month").zone()))/d,"year"===b&&(e/=12)):(d=this-f,e="second"===b?d/1e3:"minute"===b?d/6e4:"hour"===b?d/36e5:"day"===b?(d-g)/864e5:"week"===b?(d-g)/6048e5:d),c?e:j(e)},from:function(a,b){return db.duration(this.diff(a)).lang(this.lang()._abbr).humanize(!b)},fromNow:function(a){return this.from(db(),a)},calendar:function(){var a=z(db(),this).startOf("day"),b=this.diff(a,"days",!0),c=-6>b?"sameElse":-1>b?"lastWeek":0>b?"lastDay":1>b?"sameDay":2>b?"nextDay":7>b?"nextWeek":"sameElse";return this.format(this.lang().calendar(c,this))},isLeapYear:function(){return v(this.year())},isDST:function(){return this.zone()<this.clone().month(0).zone()||this.zone()<this.clone().month(5).zone()},day:function(a){var b=this._isUTC?this._d.getUTCDay():this._d.getDay();return null!=a?(a=V(a,this.lang()),this.add({d:a-b})):b},month:function(a){var b,c=this._isUTC?"UTC":"";return null!=a?"string"==typeof a&&(a=this.lang().monthsParse(a),"number"!=typeof a)?this:(b=this.date(),this.date(1),this._d["set"+c+"Month"](a),this.date(Math.min(b,this.daysInMonth())),db.updateOffset(this),this):this._d["get"+c+"Month"]()},startOf:function(a){switch(a=p(a)){case"year":this.month(0);case"month":this.date(1);case"week":case"isoWeek":case"day":this.hours(0);case"hour":this.minutes(0);case"minute":this.seconds(0);case"second":this.milliseconds(0)}return"week"===a?this.weekday(0):"isoWeek"===a&&this.isoWeekday(1),this},endOf:function(a){return a=p(a),this.startOf(a).add("isoWeek"===a?"week":a,1).subtract("ms",1)},isAfter:function(a,b){return b="undefined"!=typeof b?b:"millisecond",+this.clone().startOf(b)>+db(a).startOf(b)},isBefore:function(a,b){return b="undefined"!=typeof b?b:"millisecond",+this.clone().startOf(b)<+db(a).startOf(b)},isSame:function(a,b){return b=b||"ms",+this.clone().startOf(b)===+z(a,this).startOf(b)},min:function(a){return a=db.apply(null,arguments),this>a?this:a},max:function(a){return a=db.apply(null,arguments),a>this?this:a},zone:function(a){var b=this._offset||0;return null==a?this._isUTC?b:this._d.getTimezoneOffset():("string"==typeof a&&(a=I(a)),Math.abs(a)<16&&(a=60*a),this._offset=a,this._isUTC=!0,b!==a&&l(this,db.duration(b-a,"m"),1,!0),this)},zoneAbbr:function(){return this._isUTC?"UTC":""},zoneName:function(){return this._isUTC?"Coordinated Universal Time":""},parseZone:function(){return this._tzm?this.zone(this._tzm):"string"==typeof this._i&&this.zone(this._i),this},hasAlignedHourOffset:function(a){return a=a?db(a).zone():0,(this.zone()-a)%60===0},daysInMonth:function(){return t(this.year(),this.month())},dayOfYear:function(a){var b=hb((db(this).startOf("day")-db(this).startOf("year"))/864e5)+1;return null==a?b:this.add("d",a-b)},quarter:function(){return Math.ceil((this.month()+1)/3)},weekYear:function(a){var b=Y(this,this.lang()._week.dow,this.lang()._week.doy).year;return null==a?b:this.add("y",a-b)},isoWeekYear:function(a){var b=Y(this,1,4).year;return null==a?b:this.add("y",a-b)},week:function(a){var b=this.lang().week(this);return null==a?b:this.add("d",7*(a-b))},isoWeek:function(a){var b=Y(this,1,4).week;return null==a?b:this.add("d",7*(a-b))},weekday:function(a){var b=(this.day()+7-this.lang()._week.dow)%7;return null==a?b:this.add("d",a-b)},isoWeekday:function(a){return null==a?this.day()||7:this.day(this.day()%7?a:a-7)},get:function(a){return a=p(a),this[a]()},set:function(a,b){return a=p(a),"function"==typeof this[a]&&this[a](b),this},lang:function(b){return b===a?this._lang:(this._lang=C(b),this)}}),eb=0;eb<Rb.length;eb++)_(Rb[eb].toLowerCase().replace(/s$/,""),Rb[eb]);_("year","FullYear"),db.fn.days=db.fn.day,db.fn.months=db.fn.month,db.fn.weeks=db.fn.week,db.fn.isoWeeks=db.fn.isoWeek,db.fn.toJSON=db.fn.toISOString,h(db.duration.fn=g.prototype,{_bubble:function(){var a,b,c,d,e=this._milliseconds,f=this._days,g=this._months,h=this._data;h.milliseconds=e%1e3,a=j(e/1e3),h.seconds=a%60,b=j(a/60),h.minutes=b%60,c=j(b/60),h.hours=c%24,f+=j(c/24),h.days=f%30,g+=j(f/30),h.months=g%12,d=j(g/12),h.years=d},weeks:function(){return j(this.days()/7)},valueOf:function(){return this._milliseconds+864e5*this._days+this._months%12*2592e6+31536e6*s(this._months/12)},humanize:function(a){var b=+this,c=X(b,!a,this.lang());return a&&(c=this.lang().pastFuture(b,c)),this.lang().postformat(c)},add:function(a,b){var c=db.duration(a,b);return this._milliseconds+=c._milliseconds,this._days+=c._days,this._months+=c._months,this._bubble(),this},subtract:function(a,b){var c=db.duration(a,b);return this._milliseconds-=c._milliseconds,this._days-=c._days,this._months-=c._months,this._bubble(),this},get:function(a){return a=p(a),this[a.toLowerCase()+"s"]()},as:function(a){return a=p(a),this["as"+a.charAt(0).toUpperCase()+a.slice(1)+"s"]()},lang:db.fn.lang,toIsoString:function(){var a=Math.abs(this.years()),b=Math.abs(this.months()),c=Math.abs(this.days()),d=Math.abs(this.hours()),e=Math.abs(this.minutes()),f=Math.abs(this.seconds()+this.milliseconds()/1e3);return this.asSeconds()?(this.asSeconds()<0?"-":"")+"P"+(a?a+"Y":"")+(b?b+"M":"")+(c?c+"D":"")+(d||e||f?"T":"")+(d?d+"H":"")+(e?e+"M":"")+(f?f+"S":""):"P0D"}});for(eb in Sb)Sb.hasOwnProperty(eb)&&(bb(eb,Sb[eb]),ab(eb.toLowerCase()));bb("Weeks",6048e5),db.duration.fn.asMonths=function(){return(+this-31536e6*this.years())/2592e6+12*this.years()},db.lang("en",{ordinal:function(a){var b=a%10,c=1===s(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th";return a+c}}),rb?(module.exports=db,cb(!0)):"function"==typeof define&&define.amd?define("moment",function(b,c,d){return d.config&&d.config()&&d.config().noGlobal!==!0&&cb(d.config().noGlobal===a),db}):cb()}).call(this);_.moment = moment;
delete this.moment;
(function(){
/*!

 handlebars v1.3.0

Copyright (C) 2011 by Yehuda Katz

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
var Handlebars=function(){var a=function(){"use strict";function a(a){this.string=a}var b;return a.prototype.toString=function(){return""+this.string},b=a}(),b=function(a){"use strict";function b(a){return h[a]||"&amp;"}function c(a,b){for(var c in b)Object.prototype.hasOwnProperty.call(b,c)&&(a[c]=b[c])}function d(a){return a instanceof g?a.toString():a||0===a?(a=""+a,j.test(a)?a.replace(i,b):a):""}function e(a){return a||0===a?m(a)&&0===a.length?!0:!1:!0}var f={},g=a,h={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},i=/[&<>"'`]/g,j=/[&<>"'`]/;f.extend=c;var k=Object.prototype.toString;f.toString=k;var l=function(a){return"function"==typeof a};l(/x/)&&(l=function(a){return"function"==typeof a&&"[object Function]"===k.call(a)});var l;f.isFunction=l;var m=Array.isArray||function(a){return a&&"object"==typeof a?"[object Array]"===k.call(a):!1};return f.isArray=m,f.escapeExpression=d,f.isEmpty=e,f}(a),c=function(){"use strict";function a(a,b){var d;b&&b.firstLine&&(d=b.firstLine,a+=" - "+d+":"+b.firstColumn);for(var e=Error.prototype.constructor.call(this,a),f=0;f<c.length;f++)this[c[f]]=e[c[f]];d&&(this.lineNumber=d,this.column=b.firstColumn)}var b,c=["description","fileName","lineNumber","message","name","number","stack"];return a.prototype=new Error,b=a}(),d=function(a,b){"use strict";function c(a,b){this.helpers=a||{},this.partials=b||{},d(this)}function d(a){a.registerHelper("helperMissing",function(a){if(2===arguments.length)return void 0;throw new h("Missing helper: '"+a+"'")}),a.registerHelper("blockHelperMissing",function(b,c){var d=c.inverse||function(){},e=c.fn;return m(b)&&(b=b.call(this)),b===!0?e(this):b===!1||null==b?d(this):l(b)?b.length>0?a.helpers.each(b,c):d(this):e(b)}),a.registerHelper("each",function(a,b){var c,d=b.fn,e=b.inverse,f=0,g="";if(m(a)&&(a=a.call(this)),b.data&&(c=q(b.data)),a&&"object"==typeof a)if(l(a))for(var h=a.length;h>f;f++)c&&(c.index=f,c.first=0===f,c.last=f===a.length-1),g+=d(a[f],{data:c});else for(var i in a)a.hasOwnProperty(i)&&(c&&(c.key=i,c.index=f,c.first=0===f),g+=d(a[i],{data:c}),f++);return 0===f&&(g=e(this)),g}),a.registerHelper("if",function(a,b){return m(a)&&(a=a.call(this)),!b.hash.includeZero&&!a||g.isEmpty(a)?b.inverse(this):b.fn(this)}),a.registerHelper("unless",function(b,c){return a.helpers["if"].call(this,b,{fn:c.inverse,inverse:c.fn,hash:c.hash})}),a.registerHelper("with",function(a,b){return m(a)&&(a=a.call(this)),g.isEmpty(a)?void 0:b.fn(a)}),a.registerHelper("log",function(b,c){var d=c.data&&null!=c.data.level?parseInt(c.data.level,10):1;a.log(d,b)})}function e(a,b){p.log(a,b)}var f={},g=a,h=b,i="1.3.0";f.VERSION=i;var j=4;f.COMPILER_REVISION=j;var k={1:"<= 1.0.rc.2",2:"== 1.0.0-rc.3",3:"== 1.0.0-rc.4",4:">= 1.0.0"};f.REVISION_CHANGES=k;var l=g.isArray,m=g.isFunction,n=g.toString,o="[object Object]";f.HandlebarsEnvironment=c,c.prototype={constructor:c,logger:p,log:e,registerHelper:function(a,b,c){if(n.call(a)===o){if(c||b)throw new h("Arg not supported with multiple helpers");g.extend(this.helpers,a)}else c&&(b.not=c),this.helpers[a]=b},registerPartial:function(a,b){n.call(a)===o?g.extend(this.partials,a):this.partials[a]=b}};var p={methodMap:{0:"debug",1:"info",2:"warn",3:"error"},DEBUG:0,INFO:1,WARN:2,ERROR:3,level:3,log:function(a,b){if(p.level<=a){var c=p.methodMap[a];"undefined"!=typeof console&&console[c]&&console[c].call(console,b)}}};f.logger=p,f.log=e;var q=function(a){var b={};return g.extend(b,a),b};return f.createFrame=q,f}(b,c),e=function(a,b,c){"use strict";function d(a){var b=a&&a[0]||1,c=m;if(b!==c){if(c>b){var d=n[c],e=n[b];throw new l("Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version ("+d+") or downgrade your runtime to an older version ("+e+").")}throw new l("Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version ("+a[1]+").")}}function e(a,b){if(!b)throw new l("No environment passed to template");var c=function(a,c,d,e,f,g){var h=b.VM.invokePartial.apply(this,arguments);if(null!=h)return h;if(b.compile){var i={helpers:e,partials:f,data:g};return f[c]=b.compile(a,{data:void 0!==g},b),f[c](d,i)}throw new l("The partial "+c+" could not be compiled when running in runtime-only mode")},d={escapeExpression:k.escapeExpression,invokePartial:c,programs:[],program:function(a,b,c){var d=this.programs[a];return c?d=g(a,b,c):d||(d=this.programs[a]=g(a,b)),d},merge:function(a,b){var c=a||b;return a&&b&&a!==b&&(c={},k.extend(c,b),k.extend(c,a)),c},programWithDepth:b.VM.programWithDepth,noop:b.VM.noop,compilerInfo:null};return function(c,e){e=e||{};var f,g,h=e.partial?e:b;e.partial||(f=e.helpers,g=e.partials);var i=a.call(d,h,c,f,g,e.data);return e.partial||b.VM.checkRevision(d.compilerInfo),i}}function f(a,b,c){var d=Array.prototype.slice.call(arguments,3),e=function(a,e){return e=e||{},b.apply(this,[a,e.data||c].concat(d))};return e.program=a,e.depth=d.length,e}function g(a,b,c){var d=function(a,d){return d=d||{},b(a,d.data||c)};return d.program=a,d.depth=0,d}function h(a,b,c,d,e,f){var g={partial:!0,helpers:d,partials:e,data:f};if(void 0===a)throw new l("The partial "+b+" could not be found");return a instanceof Function?a(c,g):void 0}function i(){return""}var j={},k=a,l=b,m=c.COMPILER_REVISION,n=c.REVISION_CHANGES;return j.checkRevision=d,j.template=e,j.programWithDepth=f,j.program=g,j.invokePartial=h,j.noop=i,j}(b,c,d),f=function(a,b,c,d,e){"use strict";var f,g=a,h=b,i=c,j=d,k=e,l=function(){var a=new g.HandlebarsEnvironment;return j.extend(a,g),a.SafeString=h,a.Exception=i,a.Utils=j,a.VM=k,a.template=function(b){return k.template(b,a)},a},m=l();return m.create=l,f=m}(d,a,c,b,e),g=function(a){"use strict";function b(a){a=a||{},this.firstLine=a.first_line,this.firstColumn=a.first_column,this.lastColumn=a.last_column,this.lastLine=a.last_line}var c,d=a,e={ProgramNode:function(a,c,d,f){var g,h;3===arguments.length?(f=d,d=null):2===arguments.length&&(f=c,c=null),b.call(this,f),this.type="program",this.statements=a,this.strip={},d?(h=d[0],h?(g={first_line:h.firstLine,last_line:h.lastLine,last_column:h.lastColumn,first_column:h.firstColumn},this.inverse=new e.ProgramNode(d,c,g)):this.inverse=new e.ProgramNode(d,c),this.strip.right=c.left):c&&(this.strip.left=c.right)},MustacheNode:function(a,c,d,f,g){if(b.call(this,g),this.type="mustache",this.strip=f,null!=d&&d.charAt){var h=d.charAt(3)||d.charAt(2);this.escaped="{"!==h&&"&"!==h}else this.escaped=!!d;this.sexpr=a instanceof e.SexprNode?a:new e.SexprNode(a,c),this.sexpr.isRoot=!0,this.id=this.sexpr.id,this.params=this.sexpr.params,this.hash=this.sexpr.hash,this.eligibleHelper=this.sexpr.eligibleHelper,this.isHelper=this.sexpr.isHelper},SexprNode:function(a,c,d){b.call(this,d),this.type="sexpr",this.hash=c;var e=this.id=a[0],f=this.params=a.slice(1),g=this.eligibleHelper=e.isSimple;this.isHelper=g&&(f.length||c)},PartialNode:function(a,c,d,e){b.call(this,e),this.type="partial",this.partialName=a,this.context=c,this.strip=d},BlockNode:function(a,c,e,f,g){if(b.call(this,g),a.sexpr.id.original!==f.path.original)throw new d(a.sexpr.id.original+" doesn't match "+f.path.original,this);this.type="block",this.mustache=a,this.program=c,this.inverse=e,this.strip={left:a.strip.left,right:f.strip.right},(c||e).strip.left=a.strip.right,(e||c).strip.right=f.strip.left,e&&!c&&(this.isInverse=!0)},ContentNode:function(a,c){b.call(this,c),this.type="content",this.string=a},HashNode:function(a,c){b.call(this,c),this.type="hash",this.pairs=a},IdNode:function(a,c){b.call(this,c),this.type="ID";for(var e="",f=[],g=0,h=0,i=a.length;i>h;h++){var j=a[h].part;if(e+=(a[h].separator||"")+j,".."===j||"."===j||"this"===j){if(f.length>0)throw new d("Invalid path: "+e,this);".."===j?g++:this.isScoped=!0}else f.push(j)}this.original=e,this.parts=f,this.string=f.join("."),this.depth=g,this.isSimple=1===a.length&&!this.isScoped&&0===g,this.stringModeValue=this.string},PartialNameNode:function(a,c){b.call(this,c),this.type="PARTIAL_NAME",this.name=a.original},DataNode:function(a,c){b.call(this,c),this.type="DATA",this.id=a},StringNode:function(a,c){b.call(this,c),this.type="STRING",this.original=this.string=this.stringModeValue=a},IntegerNode:function(a,c){b.call(this,c),this.type="INTEGER",this.original=this.integer=a,this.stringModeValue=Number(a)},BooleanNode:function(a,c){b.call(this,c),this.type="BOOLEAN",this.bool=a,this.stringModeValue="true"===a},CommentNode:function(a,c){b.call(this,c),this.type="comment",this.comment=a}};return c=e}(c),h=function(){"use strict";var a,b=function(){function a(a,b){return{left:"~"===a.charAt(2),right:"~"===b.charAt(0)||"~"===b.charAt(1)}}function b(){this.yy={}}var c={trace:function(){},yy:{},symbols_:{error:2,root:3,statements:4,EOF:5,program:6,simpleInverse:7,statement:8,openInverse:9,closeBlock:10,openBlock:11,mustache:12,partial:13,CONTENT:14,COMMENT:15,OPEN_BLOCK:16,sexpr:17,CLOSE:18,OPEN_INVERSE:19,OPEN_ENDBLOCK:20,path:21,OPEN:22,OPEN_UNESCAPED:23,CLOSE_UNESCAPED:24,OPEN_PARTIAL:25,partialName:26,partial_option0:27,sexpr_repetition0:28,sexpr_option0:29,dataName:30,param:31,STRING:32,INTEGER:33,BOOLEAN:34,OPEN_SEXPR:35,CLOSE_SEXPR:36,hash:37,hash_repetition_plus0:38,hashSegment:39,ID:40,EQUALS:41,DATA:42,pathSegments:43,SEP:44,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",14:"CONTENT",15:"COMMENT",16:"OPEN_BLOCK",18:"CLOSE",19:"OPEN_INVERSE",20:"OPEN_ENDBLOCK",22:"OPEN",23:"OPEN_UNESCAPED",24:"CLOSE_UNESCAPED",25:"OPEN_PARTIAL",32:"STRING",33:"INTEGER",34:"BOOLEAN",35:"OPEN_SEXPR",36:"CLOSE_SEXPR",40:"ID",41:"EQUALS",42:"DATA",44:"SEP"},productions_:[0,[3,2],[3,1],[6,2],[6,3],[6,2],[6,1],[6,1],[6,0],[4,1],[4,2],[8,3],[8,3],[8,1],[8,1],[8,1],[8,1],[11,3],[9,3],[10,3],[12,3],[12,3],[13,4],[7,2],[17,3],[17,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,3],[37,1],[39,3],[26,1],[26,1],[26,1],[30,2],[21,1],[43,3],[43,1],[27,0],[27,1],[28,0],[28,2],[29,0],[29,1],[38,1],[38,2]],performAction:function(b,c,d,e,f,g){var h=g.length-1;switch(f){case 1:return new e.ProgramNode(g[h-1],this._$);case 2:return new e.ProgramNode([],this._$);case 3:this.$=new e.ProgramNode([],g[h-1],g[h],this._$);break;case 4:this.$=new e.ProgramNode(g[h-2],g[h-1],g[h],this._$);break;case 5:this.$=new e.ProgramNode(g[h-1],g[h],[],this._$);break;case 6:this.$=new e.ProgramNode(g[h],this._$);break;case 7:this.$=new e.ProgramNode([],this._$);break;case 8:this.$=new e.ProgramNode([],this._$);break;case 9:this.$=[g[h]];break;case 10:g[h-1].push(g[h]),this.$=g[h-1];break;case 11:this.$=new e.BlockNode(g[h-2],g[h-1].inverse,g[h-1],g[h],this._$);break;case 12:this.$=new e.BlockNode(g[h-2],g[h-1],g[h-1].inverse,g[h],this._$);break;case 13:this.$=g[h];break;case 14:this.$=g[h];break;case 15:this.$=new e.ContentNode(g[h],this._$);break;case 16:this.$=new e.CommentNode(g[h],this._$);break;case 17:this.$=new e.MustacheNode(g[h-1],null,g[h-2],a(g[h-2],g[h]),this._$);break;case 18:this.$=new e.MustacheNode(g[h-1],null,g[h-2],a(g[h-2],g[h]),this._$);break;case 19:this.$={path:g[h-1],strip:a(g[h-2],g[h])};break;case 20:this.$=new e.MustacheNode(g[h-1],null,g[h-2],a(g[h-2],g[h]),this._$);break;case 21:this.$=new e.MustacheNode(g[h-1],null,g[h-2],a(g[h-2],g[h]),this._$);break;case 22:this.$=new e.PartialNode(g[h-2],g[h-1],a(g[h-3],g[h]),this._$);break;case 23:this.$=a(g[h-1],g[h]);break;case 24:this.$=new e.SexprNode([g[h-2]].concat(g[h-1]),g[h],this._$);break;case 25:this.$=new e.SexprNode([g[h]],null,this._$);break;case 26:this.$=g[h];break;case 27:this.$=new e.StringNode(g[h],this._$);break;case 28:this.$=new e.IntegerNode(g[h],this._$);break;case 29:this.$=new e.BooleanNode(g[h],this._$);break;case 30:this.$=g[h];break;case 31:g[h-1].isHelper=!0,this.$=g[h-1];break;case 32:this.$=new e.HashNode(g[h],this._$);break;case 33:this.$=[g[h-2],g[h]];break;case 34:this.$=new e.PartialNameNode(g[h],this._$);break;case 35:this.$=new e.PartialNameNode(new e.StringNode(g[h],this._$),this._$);break;case 36:this.$=new e.PartialNameNode(new e.IntegerNode(g[h],this._$));break;case 37:this.$=new e.DataNode(g[h],this._$);break;case 38:this.$=new e.IdNode(g[h],this._$);break;case 39:g[h-2].push({part:g[h],separator:g[h-1]}),this.$=g[h-2];break;case 40:this.$=[{part:g[h]}];break;case 43:this.$=[];break;case 44:g[h-1].push(g[h]);break;case 47:this.$=[g[h]];break;case 48:g[h-1].push(g[h])}},table:[{3:1,4:2,5:[1,3],8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],22:[1,13],23:[1,14],25:[1,15]},{1:[3]},{5:[1,16],8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],22:[1,13],23:[1,14],25:[1,15]},{1:[2,2]},{5:[2,9],14:[2,9],15:[2,9],16:[2,9],19:[2,9],20:[2,9],22:[2,9],23:[2,9],25:[2,9]},{4:20,6:18,7:19,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,21],20:[2,8],22:[1,13],23:[1,14],25:[1,15]},{4:20,6:22,7:19,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,21],20:[2,8],22:[1,13],23:[1,14],25:[1,15]},{5:[2,13],14:[2,13],15:[2,13],16:[2,13],19:[2,13],20:[2,13],22:[2,13],23:[2,13],25:[2,13]},{5:[2,14],14:[2,14],15:[2,14],16:[2,14],19:[2,14],20:[2,14],22:[2,14],23:[2,14],25:[2,14]},{5:[2,15],14:[2,15],15:[2,15],16:[2,15],19:[2,15],20:[2,15],22:[2,15],23:[2,15],25:[2,15]},{5:[2,16],14:[2,16],15:[2,16],16:[2,16],19:[2,16],20:[2,16],22:[2,16],23:[2,16],25:[2,16]},{17:23,21:24,30:25,40:[1,28],42:[1,27],43:26},{17:29,21:24,30:25,40:[1,28],42:[1,27],43:26},{17:30,21:24,30:25,40:[1,28],42:[1,27],43:26},{17:31,21:24,30:25,40:[1,28],42:[1,27],43:26},{21:33,26:32,32:[1,34],33:[1,35],40:[1,28],43:26},{1:[2,1]},{5:[2,10],14:[2,10],15:[2,10],16:[2,10],19:[2,10],20:[2,10],22:[2,10],23:[2,10],25:[2,10]},{10:36,20:[1,37]},{4:38,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,7],22:[1,13],23:[1,14],25:[1,15]},{7:39,8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,21],20:[2,6],22:[1,13],23:[1,14],25:[1,15]},{17:23,18:[1,40],21:24,30:25,40:[1,28],42:[1,27],43:26},{10:41,20:[1,37]},{18:[1,42]},{18:[2,43],24:[2,43],28:43,32:[2,43],33:[2,43],34:[2,43],35:[2,43],36:[2,43],40:[2,43],42:[2,43]},{18:[2,25],24:[2,25],36:[2,25]},{18:[2,38],24:[2,38],32:[2,38],33:[2,38],34:[2,38],35:[2,38],36:[2,38],40:[2,38],42:[2,38],44:[1,44]},{21:45,40:[1,28],43:26},{18:[2,40],24:[2,40],32:[2,40],33:[2,40],34:[2,40],35:[2,40],36:[2,40],40:[2,40],42:[2,40],44:[2,40]},{18:[1,46]},{18:[1,47]},{24:[1,48]},{18:[2,41],21:50,27:49,40:[1,28],43:26},{18:[2,34],40:[2,34]},{18:[2,35],40:[2,35]},{18:[2,36],40:[2,36]},{5:[2,11],14:[2,11],15:[2,11],16:[2,11],19:[2,11],20:[2,11],22:[2,11],23:[2,11],25:[2,11]},{21:51,40:[1,28],43:26},{8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,3],22:[1,13],23:[1,14],25:[1,15]},{4:52,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,5],22:[1,13],23:[1,14],25:[1,15]},{14:[2,23],15:[2,23],16:[2,23],19:[2,23],20:[2,23],22:[2,23],23:[2,23],25:[2,23]},{5:[2,12],14:[2,12],15:[2,12],16:[2,12],19:[2,12],20:[2,12],22:[2,12],23:[2,12],25:[2,12]},{14:[2,18],15:[2,18],16:[2,18],19:[2,18],20:[2,18],22:[2,18],23:[2,18],25:[2,18]},{18:[2,45],21:56,24:[2,45],29:53,30:60,31:54,32:[1,57],33:[1,58],34:[1,59],35:[1,61],36:[2,45],37:55,38:62,39:63,40:[1,64],42:[1,27],43:26},{40:[1,65]},{18:[2,37],24:[2,37],32:[2,37],33:[2,37],34:[2,37],35:[2,37],36:[2,37],40:[2,37],42:[2,37]},{14:[2,17],15:[2,17],16:[2,17],19:[2,17],20:[2,17],22:[2,17],23:[2,17],25:[2,17]},{5:[2,20],14:[2,20],15:[2,20],16:[2,20],19:[2,20],20:[2,20],22:[2,20],23:[2,20],25:[2,20]},{5:[2,21],14:[2,21],15:[2,21],16:[2,21],19:[2,21],20:[2,21],22:[2,21],23:[2,21],25:[2,21]},{18:[1,66]},{18:[2,42]},{18:[1,67]},{8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,4],22:[1,13],23:[1,14],25:[1,15]},{18:[2,24],24:[2,24],36:[2,24]},{18:[2,44],24:[2,44],32:[2,44],33:[2,44],34:[2,44],35:[2,44],36:[2,44],40:[2,44],42:[2,44]},{18:[2,46],24:[2,46],36:[2,46]},{18:[2,26],24:[2,26],32:[2,26],33:[2,26],34:[2,26],35:[2,26],36:[2,26],40:[2,26],42:[2,26]},{18:[2,27],24:[2,27],32:[2,27],33:[2,27],34:[2,27],35:[2,27],36:[2,27],40:[2,27],42:[2,27]},{18:[2,28],24:[2,28],32:[2,28],33:[2,28],34:[2,28],35:[2,28],36:[2,28],40:[2,28],42:[2,28]},{18:[2,29],24:[2,29],32:[2,29],33:[2,29],34:[2,29],35:[2,29],36:[2,29],40:[2,29],42:[2,29]},{18:[2,30],24:[2,30],32:[2,30],33:[2,30],34:[2,30],35:[2,30],36:[2,30],40:[2,30],42:[2,30]},{17:68,21:24,30:25,40:[1,28],42:[1,27],43:26},{18:[2,32],24:[2,32],36:[2,32],39:69,40:[1,70]},{18:[2,47],24:[2,47],36:[2,47],40:[2,47]},{18:[2,40],24:[2,40],32:[2,40],33:[2,40],34:[2,40],35:[2,40],36:[2,40],40:[2,40],41:[1,71],42:[2,40],44:[2,40]},{18:[2,39],24:[2,39],32:[2,39],33:[2,39],34:[2,39],35:[2,39],36:[2,39],40:[2,39],42:[2,39],44:[2,39]},{5:[2,22],14:[2,22],15:[2,22],16:[2,22],19:[2,22],20:[2,22],22:[2,22],23:[2,22],25:[2,22]},{5:[2,19],14:[2,19],15:[2,19],16:[2,19],19:[2,19],20:[2,19],22:[2,19],23:[2,19],25:[2,19]},{36:[1,72]},{18:[2,48],24:[2,48],36:[2,48],40:[2,48]},{41:[1,71]},{21:56,30:60,31:73,32:[1,57],33:[1,58],34:[1,59],35:[1,61],40:[1,28],42:[1,27],43:26},{18:[2,31],24:[2,31],32:[2,31],33:[2,31],34:[2,31],35:[2,31],36:[2,31],40:[2,31],42:[2,31]},{18:[2,33],24:[2,33],36:[2,33],40:[2,33]}],defaultActions:{3:[2,2],16:[2,1],50:[2,42]},parseError:function(a){throw new Error(a)},parse:function(a){function b(){var a;return a=c.lexer.lex()||1,"number"!=typeof a&&(a=c.symbols_[a]||a),a}var c=this,d=[0],e=[null],f=[],g=this.table,h="",i=0,j=0,k=0;this.lexer.setInput(a),this.lexer.yy=this.yy,this.yy.lexer=this.lexer,this.yy.parser=this,"undefined"==typeof this.lexer.yylloc&&(this.lexer.yylloc={});var l=this.lexer.yylloc;f.push(l);var m=this.lexer.options&&this.lexer.options.ranges;"function"==typeof this.yy.parseError&&(this.parseError=this.yy.parseError);for(var n,o,p,q,r,s,t,u,v,w={};;){if(p=d[d.length-1],this.defaultActions[p]?q=this.defaultActions[p]:((null===n||"undefined"==typeof n)&&(n=b()),q=g[p]&&g[p][n]),"undefined"==typeof q||!q.length||!q[0]){var x="";if(!k){v=[];for(s in g[p])this.terminals_[s]&&s>2&&v.push("'"+this.terminals_[s]+"'");x=this.lexer.showPosition?"Parse error on line "+(i+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+v.join(", ")+", got '"+(this.terminals_[n]||n)+"'":"Parse error on line "+(i+1)+": Unexpected "+(1==n?"end of input":"'"+(this.terminals_[n]||n)+"'"),this.parseError(x,{text:this.lexer.match,token:this.terminals_[n]||n,line:this.lexer.yylineno,loc:l,expected:v})}}if(q[0]instanceof Array&&q.length>1)throw new Error("Parse Error: multiple actions possible at state: "+p+", token: "+n);switch(q[0]){case 1:d.push(n),e.push(this.lexer.yytext),f.push(this.lexer.yylloc),d.push(q[1]),n=null,o?(n=o,o=null):(j=this.lexer.yyleng,h=this.lexer.yytext,i=this.lexer.yylineno,l=this.lexer.yylloc,k>0&&k--);break;case 2:if(t=this.productions_[q[1]][1],w.$=e[e.length-t],w._$={first_line:f[f.length-(t||1)].first_line,last_line:f[f.length-1].last_line,first_column:f[f.length-(t||1)].first_column,last_column:f[f.length-1].last_column},m&&(w._$.range=[f[f.length-(t||1)].range[0],f[f.length-1].range[1]]),r=this.performAction.call(w,h,j,i,this.yy,q[1],e,f),"undefined"!=typeof r)return r;t&&(d=d.slice(0,-1*t*2),e=e.slice(0,-1*t),f=f.slice(0,-1*t)),d.push(this.productions_[q[1]][0]),e.push(w.$),f.push(w._$),u=g[d[d.length-2]][d[d.length-1]],d.push(u);break;case 3:return!0}}return!0}},d=function(){var a={EOF:1,parseError:function(a,b){if(!this.yy.parser)throw new Error(a);this.yy.parser.parseError(a,b)},setInput:function(a){return this._input=a,this._more=this._less=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var a=this._input[0];this.yytext+=a,this.yyleng++,this.offset++,this.match+=a,this.matched+=a;var b=a.match(/(?:\r\n?|\n).*/g);return b?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),a},unput:function(a){var b=a.length,c=a.split(/(?:\r\n?|\n)/g);this._input=a+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-b-1),this.offset-=b;var d=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),c.length-1&&(this.yylineno-=c.length-1);var e=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:c?(c.length===d.length?this.yylloc.first_column:0)+d[d.length-c.length].length-c[0].length:this.yylloc.first_column-b},this.options.ranges&&(this.yylloc.range=[e[0],e[0]+this.yyleng-b]),this},more:function(){return this._more=!0,this},less:function(a){this.unput(this.match.slice(a))},pastInput:function(){var a=this.matched.substr(0,this.matched.length-this.match.length);return(a.length>20?"...":"")+a.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var a=this.match;return a.length<20&&(a+=this._input.substr(0,20-a.length)),(a.substr(0,20)+(a.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var a=this.pastInput(),b=new Array(a.length+1).join("-");return a+this.upcomingInput()+"\n"+b+"^"},next:function(){if(this.done)return this.EOF;this._input||(this.done=!0);var a,b,c,d,e;this._more||(this.yytext="",this.match="");for(var f=this._currentRules(),g=0;g<f.length&&(c=this._input.match(this.rules[f[g]]),!c||b&&!(c[0].length>b[0].length)||(b=c,d=g,this.options.flex));g++);return b?(e=b[0].match(/(?:\r\n?|\n).*/g),e&&(this.yylineno+=e.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:e?e[e.length-1].length-e[e.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+b[0].length},this.yytext+=b[0],this.match+=b[0],this.matches=b,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._input=this._input.slice(b[0].length),this.matched+=b[0],a=this.performAction.call(this,this.yy,this,f[d],this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),a?a:void 0):""===this._input?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var a=this.next();return"undefined"!=typeof a?a:this.lex()},begin:function(a){this.conditionStack.push(a)},popState:function(){return this.conditionStack.pop()},_currentRules:function(){return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules},topState:function(){return this.conditionStack[this.conditionStack.length-2]},pushState:function(a){this.begin(a)}};return a.options={},a.performAction=function(a,b,c,d){function e(a,c){return b.yytext=b.yytext.substr(a,b.yyleng-c)}switch(c){case 0:if("\\\\"===b.yytext.slice(-2)?(e(0,1),this.begin("mu")):"\\"===b.yytext.slice(-1)?(e(0,1),this.begin("emu")):this.begin("mu"),b.yytext)return 14;break;case 1:return 14;case 2:return this.popState(),14;case 3:return e(0,4),this.popState(),15;case 4:return 35;case 5:return 36;case 6:return 25;case 7:return 16;case 8:return 20;case 9:return 19;case 10:return 19;case 11:return 23;case 12:return 22;case 13:this.popState(),this.begin("com");break;case 14:return e(3,5),this.popState(),15;case 15:return 22;case 16:return 41;case 17:return 40;case 18:return 40;case 19:return 44;case 20:break;case 21:return this.popState(),24;case 22:return this.popState(),18;case 23:return b.yytext=e(1,2).replace(/\\"/g,'"'),32;case 24:return b.yytext=e(1,2).replace(/\\'/g,"'"),32;case 25:return 42;case 26:return 34;case 27:return 34;case 28:return 33;case 29:return 40;case 30:return b.yytext=e(1,2),40;case 31:return"INVALID";case 32:return 5}},a.rules=[/^(?:[^\x00]*?(?=(\{\{)))/,/^(?:[^\x00]+)/,/^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/,/^(?:[\s\S]*?--\}\})/,/^(?:\()/,/^(?:\))/,/^(?:\{\{(~)?>)/,/^(?:\{\{(~)?#)/,/^(?:\{\{(~)?\/)/,/^(?:\{\{(~)?\^)/,/^(?:\{\{(~)?\s*else\b)/,/^(?:\{\{(~)?\{)/,/^(?:\{\{(~)?&)/,/^(?:\{\{!--)/,/^(?:\{\{![\s\S]*?\}\})/,/^(?:\{\{(~)?)/,/^(?:=)/,/^(?:\.\.)/,/^(?:\.(?=([=~}\s\/.)])))/,/^(?:[\/.])/,/^(?:\s+)/,/^(?:\}(~)?\}\})/,/^(?:(~)?\}\})/,/^(?:"(\\["]|[^"])*")/,/^(?:'(\\[']|[^'])*')/,/^(?:@)/,/^(?:true(?=([~}\s)])))/,/^(?:false(?=([~}\s)])))/,/^(?:-?[0-9]+(?=([~}\s)])))/,/^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)]))))/,/^(?:\[[^\]]*\])/,/^(?:.)/,/^(?:$)/],a.conditions={mu:{rules:[4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32],inclusive:!1},emu:{rules:[2],inclusive:!1},com:{rules:[3],inclusive:!1},INITIAL:{rules:[0,1,32],inclusive:!0}},a}();return c.lexer=d,b.prototype=c,c.Parser=b,new b}();return a=b}(),i=function(a,b){"use strict";function c(a){return a.constructor===f.ProgramNode?a:(e.yy=f,e.parse(a))}var d={},e=a,f=b;return d.parser=e,d.parse=c,d}(h,g),j=function(a){"use strict";function b(){}function c(a,b,c){if(null==a||"string"!=typeof a&&a.constructor!==c.AST.ProgramNode)throw new f("You must pass a string or Handlebars AST to Handlebars.precompile. You passed "+a);b=b||{},"data"in b||(b.data=!0);var d=c.parse(a),e=(new c.Compiler).compile(d,b);return(new c.JavaScriptCompiler).compile(e,b)}function d(a,b,c){function d(){var d=c.parse(a),e=(new c.Compiler).compile(d,b),f=(new c.JavaScriptCompiler).compile(e,b,void 0,!0);return c.template(f)}if(null==a||"string"!=typeof a&&a.constructor!==c.AST.ProgramNode)throw new f("You must pass a string or Handlebars AST to Handlebars.compile. You passed "+a);b=b||{},"data"in b||(b.data=!0);var e;return function(a,b){return e||(e=d()),e.call(this,a,b)}}var e={},f=a;return e.Compiler=b,b.prototype={compiler:b,disassemble:function(){for(var a,b,c,d=this.opcodes,e=[],f=0,g=d.length;g>f;f++)if(a=d[f],"DECLARE"===a.opcode)e.push("DECLARE "+a.name+"="+a.value);else{b=[];for(var h=0;h<a.args.length;h++)c=a.args[h],"string"==typeof c&&(c='"'+c.replace("\n","\\n")+'"'),b.push(c);e.push(a.opcode+" "+b.join(" "))}return e.join("\n")},equals:function(a){var b=this.opcodes.length;if(a.opcodes.length!==b)return!1;for(var c=0;b>c;c++){var d=this.opcodes[c],e=a.opcodes[c];if(d.opcode!==e.opcode||d.args.length!==e.args.length)return!1;for(var f=0;f<d.args.length;f++)if(d.args[f]!==e.args[f])return!1}if(b=this.children.length,a.children.length!==b)return!1;for(c=0;b>c;c++)if(!this.children[c].equals(a.children[c]))return!1;return!0},guid:0,compile:function(a,b){this.opcodes=[],this.children=[],this.depths={list:[]},this.options=b;var c=this.options.knownHelpers;if(this.options.knownHelpers={helperMissing:!0,blockHelperMissing:!0,each:!0,"if":!0,unless:!0,"with":!0,log:!0},c)for(var d in c)this.options.knownHelpers[d]=c[d];return this.accept(a)},accept:function(a){var b,c=a.strip||{};return c.left&&this.opcode("strip"),b=this[a.type](a),c.right&&this.opcode("strip"),b},program:function(a){for(var b=a.statements,c=0,d=b.length;d>c;c++)this.accept(b[c]);return this.isSimple=1===d,this.depths.list=this.depths.list.sort(function(a,b){return a-b}),this},compileProgram:function(a){var b,c=(new this.compiler).compile(a,this.options),d=this.guid++;this.usePartial=this.usePartial||c.usePartial,this.children[d]=c;for(var e=0,f=c.depths.list.length;f>e;e++)b=c.depths.list[e],2>b||this.addDepth(b-1);return d},block:function(a){var b=a.mustache,c=a.program,d=a.inverse;c&&(c=this.compileProgram(c)),d&&(d=this.compileProgram(d));var e=b.sexpr,f=this.classifySexpr(e);"helper"===f?this.helperSexpr(e,c,d):"simple"===f?(this.simpleSexpr(e),this.opcode("pushProgram",c),this.opcode("pushProgram",d),this.opcode("emptyHash"),this.opcode("blockValue")):(this.ambiguousSexpr(e,c,d),this.opcode("pushProgram",c),this.opcode("pushProgram",d),this.opcode("emptyHash"),this.opcode("ambiguousBlockValue")),this.opcode("append")},hash:function(a){var b,c,d=a.pairs;this.opcode("pushHash");for(var e=0,f=d.length;f>e;e++)b=d[e],c=b[1],this.options.stringParams?(c.depth&&this.addDepth(c.depth),this.opcode("getContext",c.depth||0),this.opcode("pushStringParam",c.stringModeValue,c.type),"sexpr"===c.type&&this.sexpr(c)):this.accept(c),this.opcode("assignToHash",b[0]);this.opcode("popHash")},partial:function(a){var b=a.partialName;this.usePartial=!0,a.context?this.ID(a.context):this.opcode("push","depth0"),this.opcode("invokePartial",b.name),this.opcode("append")},content:function(a){this.opcode("appendContent",a.string)},mustache:function(a){this.sexpr(a.sexpr),a.escaped&&!this.options.noEscape?this.opcode("appendEscaped"):this.opcode("append")},ambiguousSexpr:function(a,b,c){var d=a.id,e=d.parts[0],f=null!=b||null!=c;this.opcode("getContext",d.depth),this.opcode("pushProgram",b),this.opcode("pushProgram",c),this.opcode("invokeAmbiguous",e,f)},simpleSexpr:function(a){var b=a.id;"DATA"===b.type?this.DATA(b):b.parts.length?this.ID(b):(this.addDepth(b.depth),this.opcode("getContext",b.depth),this.opcode("pushContext")),this.opcode("resolvePossibleLambda")},helperSexpr:function(a,b,c){var d=this.setupFullMustacheParams(a,b,c),e=a.id.parts[0];if(this.options.knownHelpers[e])this.opcode("invokeKnownHelper",d.length,e);else{if(this.options.knownHelpersOnly)throw new f("You specified knownHelpersOnly, but used the unknown helper "+e,a);this.opcode("invokeHelper",d.length,e,a.isRoot)}},sexpr:function(a){var b=this.classifySexpr(a);"simple"===b?this.simpleSexpr(a):"helper"===b?this.helperSexpr(a):this.ambiguousSexpr(a)},ID:function(a){this.addDepth(a.depth),this.opcode("getContext",a.depth);var b=a.parts[0];b?this.opcode("lookupOnContext",a.parts[0]):this.opcode("pushContext");for(var c=1,d=a.parts.length;d>c;c++)this.opcode("lookup",a.parts[c])},DATA:function(a){if(this.options.data=!0,a.id.isScoped||a.id.depth)throw new f("Scoped data references are not supported: "+a.original,a);this.opcode("lookupData");for(var b=a.id.parts,c=0,d=b.length;d>c;c++)this.opcode("lookup",b[c])},STRING:function(a){this.opcode("pushString",a.string)},INTEGER:function(a){this.opcode("pushLiteral",a.integer)},BOOLEAN:function(a){this.opcode("pushLiteral",a.bool)},comment:function(){},opcode:function(a){this.opcodes.push({opcode:a,args:[].slice.call(arguments,1)})},declare:function(a,b){this.opcodes.push({opcode:"DECLARE",name:a,value:b})},addDepth:function(a){0!==a&&(this.depths[a]||(this.depths[a]=!0,this.depths.list.push(a)))},classifySexpr:function(a){var b=a.isHelper,c=a.eligibleHelper,d=this.options;if(c&&!b){var e=a.id.parts[0];d.knownHelpers[e]?b=!0:d.knownHelpersOnly&&(c=!1)}return b?"helper":c?"ambiguous":"simple"},pushParams:function(a){for(var b,c=a.length;c--;)b=a[c],this.options.stringParams?(b.depth&&this.addDepth(b.depth),this.opcode("getContext",b.depth||0),this.opcode("pushStringParam",b.stringModeValue,b.type),"sexpr"===b.type&&this.sexpr(b)):this[b.type](b)},setupFullMustacheParams:function(a,b,c){var d=a.params;return this.pushParams(d),this.opcode("pushProgram",b),this.opcode("pushProgram",c),a.hash?this.hash(a.hash):this.opcode("emptyHash"),d}},e.precompile=c,e.compile=d,e}(c),k=function(a,b){"use strict";function c(a){this.value=a}function d(){}var e,f=a.COMPILER_REVISION,g=a.REVISION_CHANGES,h=a.log,i=b;d.prototype={nameLookup:function(a,b){var c,e;return 0===a.indexOf("depth")&&(c=!0),e=/^[0-9]+$/.test(b)?a+"["+b+"]":d.isValidJavaScriptVariableName(b)?a+"."+b:a+"['"+b+"']",c?"("+a+" && "+e+")":e},compilerInfo:function(){var a=f,b=g[a];return"this.compilerInfo = ["+a+",'"+b+"'];\n"},appendToBuffer:function(a){return this.environment.isSimple?"return "+a+";":{appendToBuffer:!0,content:a,toString:function(){return"buffer += "+a+";"}}},initializeBuffer:function(){return this.quotedString("")},namespace:"Handlebars",compile:function(a,b,c,d){this.environment=a,this.options=b||{},h("debug",this.environment.disassemble()+"\n\n"),this.name=this.environment.name,this.isChild=!!c,this.context=c||{programs:[],environments:[],aliases:{}},this.preamble(),this.stackSlot=0,this.stackVars=[],this.registers={list:[]},this.hashes=[],this.compileStack=[],this.inlineStack=[],this.compileChildren(a,b);
var e,f=a.opcodes;this.i=0;for(var g=f.length;this.i<g;this.i++)e=f[this.i],"DECLARE"===e.opcode?this[e.name]=e.value:this[e.opcode].apply(this,e.args),e.opcode!==this.stripNext&&(this.stripNext=!1);if(this.pushSource(""),this.stackSlot||this.inlineStack.length||this.compileStack.length)throw new i("Compile completed with content left on stack");return this.createFunctionContext(d)},preamble:function(){var a=[];if(this.isChild)a.push("");else{var b=this.namespace,c="helpers = this.merge(helpers, "+b+".helpers);";this.environment.usePartial&&(c=c+" partials = this.merge(partials, "+b+".partials);"),this.options.data&&(c+=" data = data || {};"),a.push(c)}this.environment.isSimple?a.push(""):a.push(", buffer = "+this.initializeBuffer()),this.lastContext=0,this.source=a},createFunctionContext:function(a){var b=this.stackVars.concat(this.registers.list);if(b.length>0&&(this.source[1]=this.source[1]+", "+b.join(", ")),!this.isChild)for(var c in this.context.aliases)this.context.aliases.hasOwnProperty(c)&&(this.source[1]=this.source[1]+", "+c+"="+this.context.aliases[c]);this.source[1]&&(this.source[1]="var "+this.source[1].substring(2)+";"),this.isChild||(this.source[1]+="\n"+this.context.programs.join("\n")+"\n"),this.environment.isSimple||this.pushSource("return buffer;");for(var d=this.isChild?["depth0","data"]:["Handlebars","depth0","helpers","partials","data"],e=0,f=this.environment.depths.list.length;f>e;e++)d.push("depth"+this.environment.depths.list[e]);var g=this.mergeSource();if(this.isChild||(g=this.compilerInfo()+g),a)return d.push(g),Function.apply(this,d);var i="function "+(this.name||"")+"("+d.join(",")+") {\n  "+g+"}";return h("debug",i+"\n\n"),i},mergeSource:function(){for(var a,b="",c=0,d=this.source.length;d>c;c++){var e=this.source[c];e.appendToBuffer?a=a?a+"\n    + "+e.content:e.content:(a&&(b+="buffer += "+a+";\n  ",a=void 0),b+=e+"\n  ")}return b},blockValue:function(){this.context.aliases.blockHelperMissing="helpers.blockHelperMissing";var a=["depth0"];this.setupParams(0,a),this.replaceStack(function(b){return a.splice(1,0,b),"blockHelperMissing.call("+a.join(", ")+")"})},ambiguousBlockValue:function(){this.context.aliases.blockHelperMissing="helpers.blockHelperMissing";var a=["depth0"];this.setupParams(0,a);var b=this.topStack();a.splice(1,0,b),this.pushSource("if (!"+this.lastHelper+") { "+b+" = blockHelperMissing.call("+a.join(", ")+"); }")},appendContent:function(a){this.pendingContent&&(a=this.pendingContent+a),this.stripNext&&(a=a.replace(/^\s+/,"")),this.pendingContent=a},strip:function(){this.pendingContent&&(this.pendingContent=this.pendingContent.replace(/\s+$/,"")),this.stripNext="strip"},append:function(){this.flushInline();var a=this.popStack();this.pushSource("if("+a+" || "+a+" === 0) { "+this.appendToBuffer(a)+" }"),this.environment.isSimple&&this.pushSource("else { "+this.appendToBuffer("''")+" }")},appendEscaped:function(){this.context.aliases.escapeExpression="this.escapeExpression",this.pushSource(this.appendToBuffer("escapeExpression("+this.popStack()+")"))},getContext:function(a){this.lastContext!==a&&(this.lastContext=a)},lookupOnContext:function(a){this.push(this.nameLookup("depth"+this.lastContext,a,"context"))},pushContext:function(){this.pushStackLiteral("depth"+this.lastContext)},resolvePossibleLambda:function(){this.context.aliases.functionType='"function"',this.replaceStack(function(a){return"typeof "+a+" === functionType ? "+a+".apply(depth0) : "+a})},lookup:function(a){this.replaceStack(function(b){return b+" == null || "+b+" === false ? "+b+" : "+this.nameLookup(b,a,"context")})},lookupData:function(){this.pushStackLiteral("data")},pushStringParam:function(a,b){this.pushStackLiteral("depth"+this.lastContext),this.pushString(b),"sexpr"!==b&&("string"==typeof a?this.pushString(a):this.pushStackLiteral(a))},emptyHash:function(){this.pushStackLiteral("{}"),this.options.stringParams&&(this.push("{}"),this.push("{}"))},pushHash:function(){this.hash&&this.hashes.push(this.hash),this.hash={values:[],types:[],contexts:[]}},popHash:function(){var a=this.hash;this.hash=this.hashes.pop(),this.options.stringParams&&(this.push("{"+a.contexts.join(",")+"}"),this.push("{"+a.types.join(",")+"}")),this.push("{\n    "+a.values.join(",\n    ")+"\n  }")},pushString:function(a){this.pushStackLiteral(this.quotedString(a))},push:function(a){return this.inlineStack.push(a),a},pushLiteral:function(a){this.pushStackLiteral(a)},pushProgram:function(a){null!=a?this.pushStackLiteral(this.programExpression(a)):this.pushStackLiteral(null)},invokeHelper:function(a,b,c){this.context.aliases.helperMissing="helpers.helperMissing",this.useRegister("helper");var d=this.lastHelper=this.setupHelper(a,b,!0),e=this.nameLookup("depth"+this.lastContext,b,"context"),f="helper = "+d.name+" || "+e;d.paramsInit&&(f+=","+d.paramsInit),this.push("("+f+",helper ? helper.call("+d.callParams+") : helperMissing.call("+d.helperMissingParams+"))"),c||this.flushInline()},invokeKnownHelper:function(a,b){var c=this.setupHelper(a,b);this.push(c.name+".call("+c.callParams+")")},invokeAmbiguous:function(a,b){this.context.aliases.functionType='"function"',this.useRegister("helper"),this.emptyHash();var c=this.setupHelper(0,a,b),d=this.lastHelper=this.nameLookup("helpers",a,"helper"),e=this.nameLookup("depth"+this.lastContext,a,"context"),f=this.nextStack();c.paramsInit&&this.pushSource(c.paramsInit),this.pushSource("if (helper = "+d+") { "+f+" = helper.call("+c.callParams+"); }"),this.pushSource("else { helper = "+e+"; "+f+" = typeof helper === functionType ? helper.call("+c.callParams+") : helper; }")},invokePartial:function(a){var b=[this.nameLookup("partials",a,"partial"),"'"+a+"'",this.popStack(),"helpers","partials"];this.options.data&&b.push("data"),this.context.aliases.self="this",this.push("self.invokePartial("+b.join(", ")+")")},assignToHash:function(a){var b,c,d=this.popStack();this.options.stringParams&&(c=this.popStack(),b=this.popStack());var e=this.hash;b&&e.contexts.push("'"+a+"': "+b),c&&e.types.push("'"+a+"': "+c),e.values.push("'"+a+"': ("+d+")")},compiler:d,compileChildren:function(a,b){for(var c,d,e=a.children,f=0,g=e.length;g>f;f++){c=e[f],d=new this.compiler;var h=this.matchExistingProgram(c);null==h?(this.context.programs.push(""),h=this.context.programs.length,c.index=h,c.name="program"+h,this.context.programs[h]=d.compile(c,b,this.context),this.context.environments[h]=c):(c.index=h,c.name="program"+h)}},matchExistingProgram:function(a){for(var b=0,c=this.context.environments.length;c>b;b++){var d=this.context.environments[b];if(d&&d.equals(a))return b}},programExpression:function(a){if(this.context.aliases.self="this",null==a)return"self.noop";for(var b,c=this.environment.children[a],d=c.depths.list,e=[c.index,c.name,"data"],f=0,g=d.length;g>f;f++)b=d[f],1===b?e.push("depth0"):e.push("depth"+(b-1));return(0===d.length?"self.program(":"self.programWithDepth(")+e.join(", ")+")"},register:function(a,b){this.useRegister(a),this.pushSource(a+" = "+b+";")},useRegister:function(a){this.registers[a]||(this.registers[a]=!0,this.registers.list.push(a))},pushStackLiteral:function(a){return this.push(new c(a))},pushSource:function(a){this.pendingContent&&(this.source.push(this.appendToBuffer(this.quotedString(this.pendingContent))),this.pendingContent=void 0),a&&this.source.push(a)},pushStack:function(a){this.flushInline();var b=this.incrStack();return a&&this.pushSource(b+" = "+a+";"),this.compileStack.push(b),b},replaceStack:function(a){var b,d,e,f="",g=this.isInline();if(g){var h=this.popStack(!0);if(h instanceof c)b=h.value,e=!0;else{d=!this.stackSlot;var i=d?this.incrStack():this.topStackName();f="("+this.push(i)+" = "+h+"),",b=this.topStack()}}else b=this.topStack();var j=a.call(this,b);return g?(e||this.popStack(),d&&this.stackSlot--,this.push("("+f+j+")")):(/^stack/.test(b)||(b=this.nextStack()),this.pushSource(b+" = ("+f+j+");")),b},nextStack:function(){return this.pushStack()},incrStack:function(){return this.stackSlot++,this.stackSlot>this.stackVars.length&&this.stackVars.push("stack"+this.stackSlot),this.topStackName()},topStackName:function(){return"stack"+this.stackSlot},flushInline:function(){var a=this.inlineStack;if(a.length){this.inlineStack=[];for(var b=0,d=a.length;d>b;b++){var e=a[b];e instanceof c?this.compileStack.push(e):this.pushStack(e)}}},isInline:function(){return this.inlineStack.length},popStack:function(a){var b=this.isInline(),d=(b?this.inlineStack:this.compileStack).pop();if(!a&&d instanceof c)return d.value;if(!b){if(!this.stackSlot)throw new i("Invalid stack pop");this.stackSlot--}return d},topStack:function(a){var b=this.isInline()?this.inlineStack:this.compileStack,d=b[b.length-1];return!a&&d instanceof c?d.value:d},quotedString:function(a){return'"'+a.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029")+'"'},setupHelper:function(a,b,c){var d=[],e=this.setupParams(a,d,c),f=this.nameLookup("helpers",b,"helper");return{params:d,paramsInit:e,name:f,callParams:["depth0"].concat(d).join(", "),helperMissingParams:c&&["depth0",this.quotedString(b)].concat(d).join(", ")}},setupOptions:function(a,b){var c,d,e,f=[],g=[],h=[];f.push("hash:"+this.popStack()),this.options.stringParams&&(f.push("hashTypes:"+this.popStack()),f.push("hashContexts:"+this.popStack())),d=this.popStack(),e=this.popStack(),(e||d)&&(e||(this.context.aliases.self="this",e="self.noop"),d||(this.context.aliases.self="this",d="self.noop"),f.push("inverse:"+d),f.push("fn:"+e));for(var i=0;a>i;i++)c=this.popStack(),b.push(c),this.options.stringParams&&(h.push(this.popStack()),g.push(this.popStack()));return this.options.stringParams&&(f.push("contexts:["+g.join(",")+"]"),f.push("types:["+h.join(",")+"]")),this.options.data&&f.push("data:data"),f},setupParams:function(a,b,c){var d="{"+this.setupOptions(a,b).join(",")+"}";return c?(this.useRegister("options"),b.push("options"),"options="+d):(b.push(d),"")}};for(var j="break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public let yield".split(" "),k=d.RESERVED_WORDS={},l=0,m=j.length;m>l;l++)k[j[l]]=!0;return d.isValidJavaScriptVariableName=function(a){return!d.RESERVED_WORDS[a]&&/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(a)?!0:!1},e=d}(d,c),l=function(a,b,c,d,e){"use strict";var f,g=a,h=b,i=c.parser,j=c.parse,k=d.Compiler,l=d.compile,m=d.precompile,n=e,o=g.create,p=function(){var a=o();return a.compile=function(b,c){return l(b,c,a)},a.precompile=function(b,c){return m(b,c,a)},a.AST=h,a.Compiler=k,a.JavaScriptCompiler=n,a.Parser=i,a.parse=j,a};return g=p(),g.create=p,f=g}(f,g,i,j,k);return l}();_.hb = Handlebars;
delete this.Handlebars;
})();
(
function (_){
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
 
    _.concat = function(){ return(Array.prototype.concat.apply([], arguments)); };
    _.fatal = function(){ throw(new Error("Fatal Error: " + _.format.apply(null, arguments))); };
    _.error = function(code, message, extra){
        extra = extra || {};
        if(extra.message){ extra.originalMessage = extra.message; }
        if(extra.code){ extra.originalCode = extra.code; }
        return(_.extend({
            type: 'error',
            stack: (new Error(message)).stack
        }, extra, { code: code, message: message }));
    };

    _.jsonClone = function(o){ 
        return(_.parse(_.stringify(o)));
    };

    _.regex = function(str){ return(new RegExp(str)); };

    _.onceEvery = function(val, mod, hit, miss){
        if((val % mod) === 0 && hit){ hit(); }
        else if(miss){ miss(); }
    };

    _.render = function(templateName, hash){
        if(_.render.template(templateName)){
            return(_.render.template(templateName)(hash));
        }else{
            return(null);
        }
    };

    _.render.once = function(template, hash){
        return(_.hb.compile(template)(hash));
    };

    _.render.compile = function(templateName, template){
        _.render.templates[templateName] = _.hb.compile(template);
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
                if(((i + 1) % 30) === 0){ process.nextTick(callIterator); }
                else{ callIterator(); }
            }
        })(0);
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
 
    _.exists = function(col, target, insensitive){
        if(insensitive){
            return(_.any(col, function(a){ return(a.toLowerCase() === target.toLowerCase()); }));
        }else{
            return(_.any(col, function(a){ return(a === target); }));
        }
    };
    _.join_path = function(){
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
    _.s = function(n){ return(n + ""); };
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
    _.uuid = function(len, radix) {
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
    _.sha256 = function (msg, utf8encode) {
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

    // taken from the nodejs source
    _.format = (function(){
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
}
)(_);
_.dry = (
function (_){

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

dry.fakeLogger = function(working){
    if(working){
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
    }else{
        return({
            debug: function(msg, data){},
            info: function(msg, data){},
            notice: function(msg, data){},
            warning: function(msg, data){},
            error: function(msg, data){},
            crit: function(msg, data){},
            alert: function(msg, data){},
            emerg: function(msg, data){}
        });
    }
};
 
return(dry);

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

        options = options || {};

        this._namespace = options.namespace ? options.namespace : "";
        this.timestamp(options.timestamp);

        if(options.parent){ 
            this._parent = options.parent;
            this._transports = [];
        }else{ 
            this._parent = null;
            this._transports = _.clone(this._defaultTransports);
        }

        this.level('debug'); 
        if(options.level){ this.level(options.level); }
    }

    logger.prototype._levels = ['debug', 'info', 'notice', 'warning', 'error', 'crit', 'alert', 'emerg'];
    logger.prototype._priorities = { 'debug' : 0, 'info' : 1, 'notice' : 2, 'warning' : 3, 'error' : 4, 'crit' : 5, 'alert' : 6, 'emerg' : 7 };

    logger.prototype.levels = function(){ return(this._levels); };
    logger.prototype.priorities = function(){ return(this._priorities); };

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
        if(level === undefined){
            return(this._level);
        }else{
            if(this.priority(level) < 0){ return; }
            this._level = level;
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
            /*
            _.p("log:", this);
            _.p("current log level:", this.level());
            _.p("current log priority:", this.priority());
            _.p("current log level priority:", this.priority(this.level()));
            _.p("incoming log level:", logLevel);
            _.p("incoming log level priority:", this.priority(logLevel));
            */

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

    logger.prototype.child = function(ns){ 
        return(this.make({ namespace: ns, parent: this }));
    };

    function mixin(root, options){
        root = root || {};

        root.log = new logger(options);

        return(root.log);
    }

    return(mixin());
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

    _.sout = _.stdout;
    _.serr = _.stderr;
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
_.plumber = (
function (_){

var plumber = function(f){

    if(f === undefined){ f = {}; }
    
    f.plunger = function(err){ 
        throw(err);
    };

    f.plumb = function(goodF, badF){
        var self = this;
        var args = arguments;
        return(function(err){
            if(err){ 
                args = _.toArray(args);
                if(_.isFunction(badF)){
                    args = args.slice(2);
                    args.unshift(err);
                    return badF.apply(null, args);
                }else{
                    args = args.slice(1);
                    args.unshift(err);
                    return self.plunger.apply(self, args);
                }
            }else{
                goodF.apply(null, _.toArray(arguments).slice(1));
            }
        });
    };

    return(f);
};

return(plumber);

}
)(_);
_.plumber(_);
_.hook = (
function (_){

var hooker = function(f){

    if(f === undefined){ f = {}; }
        
    f.hook = function(event, callback){
        var that = this;
        if(!event || !callback){ _.fatal("You must provide an event name and a function."); }
        event = event.toLowerCase();
        if(that._hooks === undefined){ that._hooks = {}; }
        if(that._hooks[event] === undefined){ that._hooks[event] = []; }

        that._hooks[event].push({handler: callback});
    };

    f.unhook = function(event, callback){
        var that = this;
        
        if(!that._hooks){ return; }
        
        if(!event || !callback){ _.fatal("You must provide an event name and a function."); }
        event = event.toLowerCase();

        if(that._hooks && that._hooks[event]){
            that._hooks[event] = _.filter(that._hooks[event], function(val){
                if(_.isFunction(callback)){
                    return(val.handler !== callback);                    
                }
            });
        }
    };

    f.bite = function(event){ // ..., callback
        var that = this;
        var args = _.toArray(arguments);

        var event = args.shift();
        var callback = args.pop();

        if(!_.isString(event) || !_.isFunction(callback)){
            _.fatal("You must provide an event name and a function.");
        }
        event = event.toLowerCase();
        
        if(that._hooks && that._hooks[event]){
            _.each.async(that._hooks[event], function(val, key, next, end){
                var to = _.timeout("Hook for event: " + event + " doesn't return in a timely manner, it probably forgot to call next.", 5000);
                val.handler.apply(that, _.concat(function(keepRunning){
                    to.back();
                    if(keepRunning === false){ end(); }
                    else{ next(); }
                }, args));
            }, function(){
                callback();
            });
        }else{
            callback();
        }
    };
    
    return(f);
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
_.events = {};
_.eventEmitter(_.events);
_.measurer = (
function (_){

    function measurer(options){

        options = options || {};

        this._parent = options.parent || null;
        this._transportsAsync = [];
        this._transportsSync = [this.runningTotalTransport];
    }

    measurer.prototype.parent = function(){ return(this._parent); };

    measurer.prototype.runningTotalTransport = function(measurement){
        var measurements = _.get(this, "_measurements", {});
        var category = _.get(measurements, measurement.category, {});
        var measurements = _.get(category, measurement.name, {});
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

    measurer.prototype.transportsSync = function(){ return(_.get(this, "_transportsSync", [])); };
    measurer.prototype.transportsAsync = function(){ return(_.get(this, "_transportsAsync", [])); };

    measurer.prototype.measure = function(categoryName, measurementName){
        var self = this;

        if(measurementName !== undefined || _.isObject(categoryName)){ 
            var stopped = self.stop(categoryName, measurementName);
            if(stopped !== null){ return(stopped); }
            else{ return(self.start(categoryName, measurementName)); }
        }
    };
     
    measurer.prototype.child = function(options){
        return(new measurer(_.defaults(options, { parent: this})));
    };

    measurer.prototype.start = function(categoryName, measurementName){
        var pendingMeasurements = _.get(this, "_pendingMeasurements", {});
        var category = _.get(pendingMeasurements, categoryName, {});
        var measurements = _.get(category, measurementName, {});
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

        var pendingMeasurements = _.get(this, "_pendingMeasurements", {});
        var category = _.get(pendingMeasurements, categoryName, {});
        var measurements = _.get(category, measurementName, {});
        
        var measurement = null;

        if(token){
            measurement = measurements[token];
        }else if(_.keys(measurements).length === 1){
            measurement = measurements[_.keys(measurements)[0]];
        }

        if(measurement){
            measurement.end = end;
            measurement.duration = measurement.end - measurement.start;

            self.transport(measurement);
        }

        return(measurement);
    };

    measurer.prototype.measurements = function(categoryName, measurementName){
        var measurements = _.get(this, "_measurements", {})
        
        if(!categoryName){
            return(measurements);
        }else if(!measurementName){
            return(_.get(measurements, categoryName));
        }else{
            var category = _.get(measurements, categoryName);
            if(category){ return(_.get(category, measurementName)); }
            else{ return(undefined); }
        }
    };

    measurer.prototype.last = function(categoryName, measurementName){
        var measurements = _.get(this, "_measurements", {})
        var category = _.get(measurements, categoryName);
        
        if(!measurementName){
            var result = {};
            _.each(category, function(measurements, measurementName){
                result[measurementName] = measurements.last;
            });
            return(result);
        }else{
            if(category){ return(_.get(category, measurementName).last); }
            else{ return(undefined); }
        }
    };

    measurer.prototype.displayLast = function(categoryName, writer){
        var measurements = this.last(categoryName);

        var sorted = _.map(measurements, function(value, name){
            return({ value: value, name: name});
        });

        sorted.sort(function(a, b){ return(a.value - b.value); });

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
