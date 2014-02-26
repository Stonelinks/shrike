// shrike - v0.0.0
// yet another javascript math library
//
// Copyright (c)2014 Lucas Doyle <lucas.p.doyle@gmail.com>
// Distributed under MIT license
//
// https://github.com/Stonelinks/shrike


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
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
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
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Split an array into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(array, predicate) {
    var pass = [], fail = [];
    each(array, function(elem) {
      (predicate(elem) ? pass : fail).push(elem);
    });
    return [pass, fail];
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
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
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
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
    if (!_.isObject(obj)) return [];
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
  _.isObject = function(obj) {
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
      if (obj === attrs) return true; //avoid comparing an object to itself.
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

// shrike utility functions, mostly for registering and detecting types
define('utils',[

  'underscore'

], function(_) {
  

  window.pass = window.pass || function() {};

  return function(shrike) {

    shrike.throwError = function(msg) {
      msg = msg || 'undefined error';
      throw new Error('SHRIKE: ' + msg);
    };

    var SHRIKE_DO_ASSERT = true;

    if (SHRIKE_DO_ASSERT && (window.hasOwnProperty('DEBUG') ? window.DEBUG : SHRIKE_DO_ASSERT)) {
      shrike.assert = function(cond, msg) {
        if (!cond) {
          shrike.throwError(msg);
        }
      };
    }
    else {
      shrike.assert = window.pass;
    }

    // set a (sometimes nested) property on the shrike object, warn if it conflicts
    shrike.register = function(k, v) {

      // keys can be compound
      var keys = k.split('.').reverse();
      if (keys.length == 1) {
        shrike.assert(!shrike.hasOwnProperty(k), 'shrike already has a ' + k);
        shrike[k] = v;
      }
      else {
        var lastKey = keys[0];
        var prop = shrike;
        while (keys.length > 0) {

          var thisKey = keys.pop();

          shrike.assert(!(prop.hasOwnProperty(thisKey) && !_.isObject(prop[thisKey])), 'shrike already has a ' + k);

          if (thisKey === lastKey) {
            prop[thisKey] = v;
          }
          else {

            if (!_.isObject(prop[thisKey])) {
              prop[thisKey] = {};
            }

            prop = prop[thisKey];
          }
        }
      }
    };

    // TODO: make it so you can alias things with depth >1
    shrike.alias = function(newName, orig) {
      shrike.assert(shrike.hasOwnProperty(orig), 'shrike doesn\'t have a ' + orig + ' to alias');
      shrike.register(newName, shrike[orig]);
    };

    // safe version of isArray
    shrike.register('isArray', function(thing) {
      if (_.isArray(thing)) {
        return true;
      }

      return shrike.isNativeFloatArray(thing);
    });

    // checks for special array types
    shrike.register('isNativeFloatArray', function(thing) {
      try {
        return (_.isArray(thing) !== true) && Object.prototype.toString.call(thing).slice(-'Array]'.length) == 'Array]';
      }
      catch (e) {
        return false;
      }
    });

    shrike.register('is2DArray', function(thing) {
      if (!shrike.isArray(thing)) {
        return false;
      }

      if (shrike.isNativeFloatArray(thing)) {
        return false;
      }

      if (thing.length === 0) {
        return false;
      }

      return _.every(_.map(thing, shrike.isArray));
    });

    shrike.register('isNumber', function(thing) {
      return !isNaN(parseFloat(thing)) && isFinite(thing) && !shrike.isArray(thing);
    });

    // for pretty printing a matrix
    // TODO: maybe delete this? it is old and never really used
    shrike.register('prettyPrint', function(x) {

      console.log(function() {
        if (shrike.isArray(x)) {

          if (!shrike.is2DArray(x)) {
            var ret = '[ ' + new Array(x).join(', ') + ' ]';
            return ret;
          }
          else {

            // find out what the widest number will be
            var precision = 6;
            var widest = 0;
            for (var i = 0; i < x.length; i++) {
              for (var j = 0; j < x[i].length; j++) {

                shrike.assert(!_.isString(x[i][j]), 'prettyPrint: there is a string in this matrix, you should fix that');

                if (shrike.round(x[i][j], precision).toString().length > widest) {
                  widest = shrike.round(x[i][j], precision).toString().length;
                }
              }
            }

            // add spacing and create borders
            var formatted = [];
            var border = undefined;

            for (var i = 0; i < x.length; i++) {
              var row = [];
              for (var j = 0; j < x[i].length; j++) {
                var raw = shrike.round(x[i][j], precision).toString();
                var extra_space = widest - raw.length;
                var left = '';
                var right = '';
                for (var k = 0; k < extra_space; k++) {
                  if (k >= extra_space / 2.0) {
                    left += ' ';
                  }
                  else {
                    right += ' ';
                  }
                }
                row.push(left + raw + right);
              }
              formatted.push(row);

              if (border === undefined) {
                var spacers = [];
                var spacer = '';
                for (var k = 0; k < widest; k++) {
                  spacer += '-';
                }
                for (var k = 0; k < row.length; k++) {
                  spacers.push(spacer);
                }
                border = '+-' + spacers.join('-+-') + '-+';
              }
            }

            // actually print everything
            var ret = border + '\n';
            for (var i = 0; i < x.length; i++) {
              var row = formatted[i];
              var line = '| ' + row.join(' | ') + ' |';
              ret += line + '\n';
              ret += border + '\n';
            }
            return ret;
          }
        }
        else {

          // not an array
          return x;
        }
      }());
    });
    window.pp = shrike.prettyPrint;
  }
});

// various ways of iterating through arrays
define('iterators',[

  'underscore'

], function(_) {
  

  return function(shrike) {

    // applies a function to every element in A
    // input can be a string, integer, 1d or 2d array
    // if its a string or integer, the function will just be called once
    shrike.register('scalarIterator', function(A, _function) {
      _function = _function || pass;
      if (shrike.is2DArray(A)) {
        return _.map(A, function(element) {
          return _.map(element, _function);
        });
      }
      else if (shrike.isArray(A)) {
        if (shrike.isNativeFloatArray(A)) {
          var ret = new shrike.FLOAT_ARRAY_TYPE(A.length);
          for (var i = 0; i < A.length; i++) {
            ret[i] = _function(A[i]);
          }
          return ret;
        }
        else {
          return _.map(A, _function);
        }
      }
      else {
        return _function(A);
      }
    });
  }
});

/* -*- Mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil; tab-width: 40; -*- */
/*
 * Copyright (c) 2010 Mozilla Corporation
 * Copyright (c) 2010 Vladimir Vukicevic
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/*
 * File: mjs
 *
 * Vector and Matrix math utilities for JavaScript, optimized for WebGL.
 */

define('mjs',[], function() {

/*
 * Constant: MJS_VERSION
 *
 * mjs version number aa.bb.cc, encoded as an integer of the form:
 * 0xaabbcc.
 */
const MJS_VERSION = 0x000000;

/*
 * Constant: MJS_DO_ASSERT
 *
 * Enables or disables runtime assertions.
 *
 * For potentially more performance, the assert methods can be
 * commented out in each place where they are called.
 */
const MJS_DO_ASSERT = true;

// Some hacks for running in both the shell and browser,
// and for supporting F32 and WebGLFloat arrays
// try { WebGLFloatArray  undefined; } catch (x) { WebGLFloatArray = Float32Array; }

/*
 * Constant: MJS_FLOAT_ARRAY_TYPE
 *
 * The base float array type.  By default, WebGLFloatArray.
 *
 * mjs can work with any array-like elements, but if an array
 * creation is requested, it will create an array of the type
 * MJS_FLOAT_ARRAY_TYPE.  Also, the builtin constants such as (M4x4.I)
 * will be of this type.
 */
// const MJS_FLOAT_ARRAY_TYPE = WebGLFloatArray;
// const MJS_FLOAT_ARRAY_TYPE = Float32Array;
const MJS_FLOAT_ARRAY_TYPE = Float64Array;
//const MJS_FLOAT_ARRAY_TYPE = Array;

if (MJS_DO_ASSERT) {
function MathUtils_assert(cond, msg) {
    if (!cond)
        throw "Assertion failed: " + msg;
}
} else {
function MathUtils_assert() { }
}

/*
 * Class: V3
 *
 * Methods for working with 3-element vectors.  A vector is represented by a 3-element array.
 * Any valid JavaScript array type may be used, but if new
 * vectors are created they are created using the configured MJS_FLOAT_ARRAY_TYPE.
 */

var V3 = { };

V3._temp1 = new MJS_FLOAT_ARRAY_TYPE(3);
V3._temp2 = new MJS_FLOAT_ARRAY_TYPE(3);
V3._temp3 = new MJS_FLOAT_ARRAY_TYPE(3);

if (MJS_FLOAT_ARRAY_TYPE == Array) {
    V3.x = [1.0, 0.0, 0.0];
    V3.y = [0.0, 1.0, 0.0];
    V3.z = [0.0, 0.0, 1.0];

    V3.$ = function V3_$(x, y, z) {
        return [x, y, z];
    };

    V3.clone = function V3_clone(a) {
        MathUtils_assert(a.length == 3, "a.length == 3");
        return [a[0], a[1], a[2]];
    };
} else {
    V3.x = new MJS_FLOAT_ARRAY_TYPE([1.0, 0.0, 0.0]);
    V3.y = new MJS_FLOAT_ARRAY_TYPE([0.0, 1.0, 0.0]);
    V3.z = new MJS_FLOAT_ARRAY_TYPE([0.0, 0.0, 1.0]);

/*
 * Function: V3.$
 *
 * Creates a new 3-element vector with the given values.
 *
 * Parameters:
 *
 *   x,y,z - the 3 elements of the new vector.
 *
 * Returns:
 *
 * A new vector containing with the given argument values.
 */

    V3.$ = function V3_$(x, y, z) {
        return new MJS_FLOAT_ARRAY_TYPE([x, y, z]);
    };

/*
 * Function: V3.clone
 *
 * Clone the given 3-element vector.
 *
 * Parameters:
 *
 *   a - the 3-element vector to clone
 *
 * Returns:
 *
 * A new vector with the same values as the passed-in one.
 */

    V3.clone = function V3_clone(a) {
        MathUtils_assert(a.length == 3, "a.length == 3");
        return new MJS_FLOAT_ARRAY_TYPE(a);
    };
}

V3.u = V3.x;
V3.v = V3.y;

/*
 * Function: V3.add
 *
 * Perform r = a + b.
 *
 * Parameters:
 *
 *   a - the first vector operand
 *   b - the second vector operand
 *   r - optional vector to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 3-element vector with the result.
 */
V3.add = function V3_add(a, b, r) {
    MathUtils_assert(a.length == 3, "a.length == 3");
    MathUtils_assert(b.length == 3, "b.length == 3");
    MathUtils_assert(r == undefined || r.length == 3, "r == undefined || r.length == 3");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(3);
    r[0] = a[0] + b[0];
    r[1] = a[1] + b[1];
    r[2] = a[2] + b[2];
    return r;
};

/*
 * Function: V3.sub
 *
 * Perform
 * r = a - b.
 *
 * Parameters:
 *
 *   a - the first vector operand
 *   b - the second vector operand
 *   r - optional vector to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 3-element vector with the result.
 */
V3.sub = function V3_sub(a, b, r) {
    MathUtils_assert(a.length == 3, "a.length == 3");
    MathUtils_assert(b.length == 3, "b.length == 3");
    MathUtils_assert(r == undefined || r.length == 3, "r == undefined || r.length == 3");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(3);
    r[0] = a[0] - b[0];
    r[1] = a[1] - b[1];
    r[2] = a[2] - b[2];
    return r;
};

/*
 * Function: V3.neg
 *
 * Perform
 * r = - a.
 *
 * Parameters:
 *
 *   a - the vector operand
 *   r - optional vector to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 3-element vector with the result.
 */
V3.neg = function V3_neg(a, r) {
    MathUtils_assert(a.length == 3, "a.length == 3");
    MathUtils_assert(r == undefined || r.length == 3, "r == undefined || r.length == 3");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(3);
    r[0] = - a[0];
    r[1] = - a[1];
    r[2] = - a[2];
    return r;
};

/*
 * Function: V3.direction
 *
 * Perform
 * r = (a - b) / |a - b|.  The result is the normalized
 * direction from a to b.
 *
 * Parameters:
 *
 *   a - the first vector operand
 *   b - the second vector operand
 *   r - optional vector to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 3-element vector with the result.
 */
V3.direction = function V3_direction(a, b, r) {
    MathUtils_assert(a.length == 3, "a.length == 3");
    MathUtils_assert(b.length == 3, "b.length == 3");
    MathUtils_assert(r == undefined || r.length == 3, "r == undefined || r.length == 3");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(3);
    return V3.normalize(V3.sub(a, b, r), r);
};

/*
 * Function: V3.length
 *
 * Perform r = |a|.
 *
 * Parameters:
 *
 *   a - the vector operand
 *
 * Returns:
 *
 *   The length of the given vector.
 */
V3.length = function V3_length(a) {
    MathUtils_assert(a.length == 3, "a.length == 3");

    return Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]);
};

/*
 * Function: V3.lengthSquard
 *
 * Perform r = |a|*|a|.
 *
 * Parameters:
 *
 *   a - the vector operand
 *
 * Returns:
 *
 *   The square of the length of the given vector.
 */
V3.lengthSquared = function V3_lengthSquared(a) {
    MathUtils_assert(a.length == 3, "a.length == 3");

    return a[0]*a[0] + a[1]*a[1] + a[2]*a[2];
};

/*
 * Function: V3.normalize
 *
 * Perform r = a / |a|.
 *
 * Parameters:
 *
 *   a - the vector operand
 *   r - optional vector to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 3-element vector with the result.
 */
V3.normalize = function V3_normalize(a, r) {
    MathUtils_assert(a.length == 3, "a.length == 3");
    MathUtils_assert(r == undefined || r.length == 3, "r == undefined || r.length == 3");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(3);
    var im = 1.0 / V3.length(a);
    r[0] = a[0] * im;
    r[1] = a[1] * im;
    r[2] = a[2] * im;
    return r;
};

/*
 * Function: V3.scale
 *
 * Perform r = a * k.
 *
 * Parameters:
 *
 *   a - the vector operand
 *   k - a scalar value
 *   r - optional vector to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 3-element vector with the result.
 */
V3.scale = function V3_scale(a, k, r) {
    MathUtils_assert(a.length == 3, "a.length == 3");
    MathUtils_assert(r == undefined || r.length == 3, "r == undefined || r.length == 3");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(3);
    r[0] = a[0] * k;
    r[1] = a[1] * k;
    r[2] = a[2] * k;
    return r;
};

/*
 * Function: V3.dot
 *
 * Perform
 * r = dot(a, b).
 *
 * Parameters:
 *
 *   a - the first vector operand
 *   b - the second vector operand
 *
 * Returns:
 *
 *   The dot product of a and b.
 */
V3.dot = function V3_dot(a, b) {
    MathUtils_assert(a.length == 3, "a.length == 3");
    MathUtils_assert(b.length == 3, "b.length == 3");

    return a[0] * b[0] +
        a[1] * b[1] +
        a[2] * b[2];
};

/*
 * Function: V3.cross
 *
 * Perform r = a x b.
 *
 * Parameters:
 *
 *   a - the first vector operand
 *   b - the second vector operand
 *   r - optional vector to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 3-element vector with the result.
 */
V3.cross = function V3_cross(a, b, r) {
    MathUtils_assert(a.length == 3, "a.length == 3");
    MathUtils_assert(b.length == 3, "b.length == 3");
    MathUtils_assert(r == undefined || r.length == 3, "r == undefined || r.length == 3");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(3);
    r[0] = a[1]*b[2] - a[2]*b[1];
    r[1] = a[2]*b[0] - a[0]*b[2];
    r[2] = a[0]*b[1] - a[1]*b[0];
    return r;
};

/*
 * Function: V3.mul4x4
 *
 * Perform
 * r = m * v.
 *
 * Parameters:
 *
 *   m - the 4x4 matrix operand
 *   v - the 3-element vector operand
 *   r - optional vector to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 3-element vector with the result.
 *   The 4-element result vector is divided by the w component
 *   and returned as a 3-element vector.
 */
V3.mul4x4 = function V3_mul4x4(m, v, r) {
    MathUtils_assert(m.length == 16, "m.length == 16");
    MathUtils_assert(v.length == 3, "v.length == 3");
    MathUtils_assert(r == undefined || r.length == 3, "r == undefined || r.length == 3");

    var w;
    var tmp = V3._temp1;
    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(3);
    tmp[0] = m[ 3];
    tmp[1] = m[ 7];
    tmp[2] = m[11];
    w    =  V3.dot(v, tmp) + m[15];
    tmp[0] = m[ 0];
    tmp[1] = m[ 4];
    tmp[2] = m[ 8];
    r[0] = (V3.dot(v, tmp) + m[12])/w;
    tmp[0] = m[ 1];
    tmp[1] = m[ 5];
    tmp[2] = m[ 9];
    r[1] = (V3.dot(v, tmp) + m[13])/w;
    tmp[0] = m[ 2];
    tmp[1] = m[ 6];
    tmp[2] = m[10];
    r[2] = (V3.dot(v, tmp) + m[14])/w;
    return r;
};

/*
 * Class: M4x4
 *
 * Methods for working with 4x4 matrices.  A matrix is represented by a 16-element array
 * in column-major order.  Any valid JavaScript array type may be used, but if new
 * matrices are created they are created using the configured MJS_FLOAT_ARRAY_TYPE.
 */

var M4x4 = { };

M4x4._temp1 = new MJS_FLOAT_ARRAY_TYPE(16);
M4x4._temp2 = new MJS_FLOAT_ARRAY_TYPE(16);

if (MJS_FLOAT_ARRAY_TYPE == Array) {
    M4x4.I = [1.0, 0.0, 0.0, 0.0,
              0.0, 1.0, 0.0, 0.0,
              0.0, 0.0, 1.0, 0.0,
              0.0, 0.0, 0.0, 1.0];

    M4x4.$ = function M4x4_$(m00, m01, m02, m03,
                             m04, m05, m06, m07,
                             m08, m09, m10, m11,
                             m12, m13, m14, m15)
    {
        return [m00, m01, m02, m03,
                m04, m05, m06, m07,
                m08, m09, m10, m11,
                m12, m13, m14, m15];
    };

    M4x4.clone = function M4x4_clone(m) {
        MathUtils_assert(m.length == 16, "m.length == 16");
        return new [m[0], m[1], m[2], m[3],
                    m[4], m[5], m[6], m[7],
                    m[8], m[9], m[10], m[11],
                    m[12], m[13], m[14], m[15]];
    };
} else {
    M4x4.I = new MJS_FLOAT_ARRAY_TYPE([1.0, 0.0, 0.0, 0.0,
                                   0.0, 1.0, 0.0, 0.0,
                                   0.0, 0.0, 1.0, 0.0,
                                   0.0, 0.0, 0.0, 1.0]);

/*
 * Function: M4x4.$
 *
 * Creates a new 4x4 matrix with the given values.
 *
 * Parameters:
 *
 *   m00..m15 - the 16 elements of the new matrix.
 *
 * Returns:
 *
 * A new matrix filled with the given argument values.
 */
    M4x4.$ = function M4x4_$(m00, m01, m02, m03,
                             m04, m05, m06, m07,
                             m08, m09, m10, m11,
                             m12, m13, m14, m15)
    {
        return new MJS_FLOAT_ARRAY_TYPE([m00, m01, m02, m03,
                                         m04, m05, m06, m07,
                                         m08, m09, m10, m11,
                                         m12, m13, m14, m15]);
    };

/*
 * Function: M4x4.clone
 *
 * Clone the given 4x4 matrix.
 *
 * Parameters:
 *
 *   m - the 4x4 matrix to clone
 *
 * Returns:
 *
 * A new matrix with the same values as the passed-in one.
 */
    M4x4.clone = function M4x4_clone(m) {
        MathUtils_assert(m.length == 16, "m.length == 16");
        return new MJS_FLOAT_ARRAY_TYPE(m);
    };
}

M4x4.identity = M4x4.I;

/*
 * Function: M4x4.topLeft3x3
 *
 * Return the top left 3x3 matrix from the given 4x4 matrix m.
 *
 * Parameters:
 *
 *   m - the matrix
 *   r - optional 3x3 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 3x3 matrix with the result.
 */
M4x4.topLeft3x3 = function M4x4_topLeft3x3(m, r) {
    MathUtils_assert(m.length == 16, "m.length == 16");
    MathUtils_assert(r == undefined || r.length == 9, "r == undefined || r.length == 9");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(9);
    r[0] = m[0]; r[1] = m[1]; r[2] = m[2];
    r[3] = m[4]; r[4] = m[5]; r[5] = m[6];
    r[6] = m[8]; r[7] = m[9]; r[8] = m[10];
    return r;
};

/*
 * Function: M4x4.inverseOrthonormal
 *
 * Computes the inverse of the given matrix m, assuming that
 * the matrix is orthonormal.
 *
 * Parameters:
 *
 *   m - the matrix
 *   r - optional 4x4 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 4x4 matrix with the result.
 */
M4x4.inverseOrthonormal = function M4x4_inverseOrthonormal(m, r) {
    MathUtils_assert(m.length == 16, "m.length == 16");
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");
    MathUtils_assert(m != r, "m != r");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);
    M4x4.transpose(m, r);
    var t = [m[12], m[13], m[14]];
    r[3] = r[7] = r[11] = 0;
    r[12] = -V3.dot([r[0], r[4], r[8]], t);
    r[13] = -V3.dot([r[1], r[5], r[9]], t);
    r[14] = -V3.dot([r[2], r[6], r[10]], t);
    return r;
};

/*
 * Function: M4x4.inverseTo3x3
 *
 * Computes the inverse of the given matrix m, but calculates
 * only the top left 3x3 values of the result.
 *
 * Parameters:
 *
 *   m - the matrix
 *   r - optional 3x3 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 3x3 matrix with the result.
 */
M4x4.inverseTo3x3 = function M4x4_inverseTo3x3(m, r) {
    MathUtils_assert(m.length == 16, "m.length == 16");
    MathUtils_assert(r == undefined || r.length == 9, "r == undefined || r.length == 9");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(9);

    var a11 = m[10]*m[5]-m[6]*m[9],
        a21 = -m[10]*m[1]+m[2]*m[9],
        a31 = m[6]*m[1]-m[2]*m[5],
        a12 = -m[10]*m[4]+m[6]*m[8],
        a22 = m[10]*m[0]-m[2]*m[8],
        a32 = -m[6]*m[0]+m[2]*m[4],
        a13 = m[9]*m[4]-m[5]*m[8],
        a23 = -m[9]*m[0]+m[1]*m[8],
        a33 = m[5]*m[0]-m[1]*m[4];
    var det = m[0]*(a11) + m[1]*(a12) + m[2]*(a13);
    if (det == 0) // no inverse
        throw "matrix not invertible";
    var idet = 1.0 / det;

    r[0] = idet*a11;
    r[1] = idet*a21;
    r[2] = idet*a31;
    r[3] = idet*a12;
    r[4] = idet*a22;
    r[5] = idet*a32;
    r[6] = idet*a13;
    r[7] = idet*a23;
    r[8] = idet*a33;

    return r;
};

/*
 * Function: M4x4.makeFrustum
 *
 * Creates a matrix for a projection frustum with the given parameters.
 *
 * Parameters:
 *
 *   left - the left coordinate of the frustum
 *   right- the right coordinate of the frustum
 *   bottom - the bottom coordinate of the frustum
 *   top - the top coordinate of the frustum
 *   znear - the near z distance of the frustum
 *   zfar - the far z distance of the frustum
 *   r - optional 4x4 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after creating the projection matrix.
 *   Otherwise, returns a new 4x4 matrix.
 */
M4x4.makeFrustum = function M4x4_makeFrustum(left, right, bottom, top, znear, zfar, r) {
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);

    var X = 2*znear/(right-left);
    var Y = 2*znear/(top-bottom);
    var A = (right+left)/(right-left);
    var B = (top+bottom)/(top-bottom);
    var C = -(zfar+znear)/(zfar-znear);
    var D = -2*zfar*znear/(zfar-znear);

    r[0] = 2*znear/(right-left);
    r[1] = 0;
    r[2] = 0;
    r[3] = 0;
    r[4] = 0;
    r[5] = 2*znear/(top-bottom);
    r[6] = 0;
    r[7] = 0;
    r[8] = (right+left)/(right-left);
    r[9] = (top+bottom)/(top-bottom);
    r[10] = -(zfar+znear)/(zfar-znear);
    r[11] = -1;
    r[12] = 0;
    r[13] = 0;
    r[14] = -2*zfar*znear/(zfar-znear);
    r[15] = 0;

    return r;
};

/*
 * Function: M4x4.makePerspective
 *
 * Creates a matrix for a perspective projection with the given parameters.
 *
 * Parameters:
 *
 *   fovy - field of view in the y axis, in degrees
 *   aspect - aspect ratio
 *   znear - the near z distance of the projection
 *   zfar - the far z distance of the projection
 *   r - optional 4x4 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after creating the projection matrix.
 *   Otherwise, returns a new 4x4 matrix.
 */
M4x4.makePerspective = function M4x4_makePerspective (fovy, aspect, znear, zfar, r) {
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
    var ymin = -ymax;
    var xmin = ymin * aspect;
    var xmax = ymax * aspect;

    return M4x4.makeFrustum(xmin, xmax, ymin, ymax, znear, zfar, r);
};

/*
 * Function: M4x4.makeOrtho
 *
 * Creates a matrix for an orthogonal frustum projection with the given parameters.
 *
 * Parameters:
 *
 *   left - the left coordinate of the frustum
 *   right- the right coordinate of the frustum
 *   bottom - the bottom coordinate of the frustum
 *   top - the top coordinate of the frustum
 *   znear - the near z distance of the frustum
 *   zfar - the far z distance of the frustum
 *   r - optional 4x4 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after creating the projection matrix.
 *   Otherwise, returns a new 4x4 matrix.
 */
M4x4.makeOrtho = function M4x4_makeOrtho (left, right, bottom, top, znear, zfar, r) {
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);

    var tX = -(right+left)/(right-left);
    var tY = -(top+bottom)/(top-bottom);
    var tZ = -(zfar+znear)/(zfar-znear);
    var X = 2 / (right-left);
    var Y = 2 / (top-bottom);
    var Z = -2 / (zfar-znear);

    r[0] = 2 / (right-left);
    r[1] = 0;
    r[2] = 0;
    r[3] = 0;
    r[4] = 0;
    r[5] = 2 / (top-bottom);
    r[6] = 0;
    r[7] = 0;
    r[8] = 0;
    r[9] = 0;
    r[10] = -2 / (zfar-znear);
    r[11] = 0;
    r[12] = -(right+left)/(right-left);
    r[13] = -(top+bottom)/(top-bottom);
    r[14] = -(zfar+znear)/(zfar-znear);
    r[15] = 1;

    return r;
};

/*
 * Function: M4x4.makeOrtho
 *
 * Creates a matrix for a 2D orthogonal frustum projection with the given parameters.
 * znear and zfar are assumed to be -1 and 1, respectively.
 *
 * Parameters:
 *
 *   left - the left coordinate of the frustum
 *   right- the right coordinate of the frustum
 *   bottom - the bottom coordinate of the frustum
 *   top - the top coordinate of the frustum
 *   r - optional 4x4 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after creating the projection matrix.
 *   Otherwise, returns a new 4x4 matrix.
 */
M4x4.makeOrtho2D = function M4x4_makeOrtho2D (left, right, bottom, top, r) {
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    return M4x4.makeOrtho(left, right, bottom, top, -1, 1, r);
};

/*
 * Function: M4x4.mul
 *
 * Performs r = a * b.
 *
 * Parameters:
 *
 *   a - the first matrix operand
 *   b - the second matrix operand
 *   r - optional 4x4 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 4x4 matrix with the result.
 */
M4x4.mul = function M4x4_mul(a, b, r) {
    MathUtils_assert(a.length == 16, "a.length == 16");
    MathUtils_assert(b.length == 16, "b.length == 16");
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");
    MathUtils_assert(a != r && b != r, "a != r && b != r");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);

    var a11 = a[0];
    var a21 = a[1];
    var a31 = a[2];
    var a41 = a[3];
    var a12 = a[4];
    var a22 = a[5];
    var a32 = a[6];
    var a42 = a[7];
    var a13 = a[8];
    var a23 = a[9];
    var a33 = a[10];
    var a43 = a[11];
    var a14 = a[12];
    var a24 = a[13];
    var a34 = a[14];
    var a44 = a[15];

    var b11 = b[0];
    var b21 = b[1];
    var b31 = b[2];
    var b41 = b[3];
    var b12 = b[4];
    var b22 = b[5];
    var b32 = b[6];
    var b42 = b[7];
    var b13 = b[8];
    var b23 = b[9];
    var b33 = b[10];
    var b43 = b[11];
    var b14 = b[12];
    var b24 = b[13];
    var b34 = b[14];
    var b44 = b[15];

    r[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    r[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    r[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    r[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    r[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    r[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    r[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    r[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    r[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    r[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    r[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    r[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    r[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
    r[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
    r[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
    r[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

    return r;
};

/*
 * Function: M4x4.mulOffset
 *
 * Performs r' = a * b, where r' is the 16 elements of r starting at element o.
 *
 * Parameters:
 *
 *   a - the first matrix operand
 *   b - the second matrix operand
 *   r - array to store the result in
 *   o - offset into r at which to start storing results
 *
 * Returns:
 *
 *   r
 */
M4x4.mulOffset = function M4x4_mulOffset(a, b, r, o) {
    MathUtils_assert(a.length == 16, "a.length == 16");
    MathUtils_assert(b.length == 16, "b.length == 16");

    var a21 = a[1];
    var a31 = a[2];
    var a41 = a[3];
    var a12 = a[4];
    var a22 = a[5];
    var a32 = a[6];
    var a42 = a[7];
    var a13 = a[8];
    var a23 = a[9];
    var a33 = a[10];
    var a43 = a[11];
    var a14 = a[12];
    var a24 = a[13];
    var a34 = a[14];
    var a44 = a[15];

    var b11 = b[0];
    var b21 = b[1];
    var b31 = b[2];
    var b41 = b[3];
    var b12 = b[4];
    var b22 = b[5];
    var b32 = b[6];
    var b42 = b[7];
    var b13 = b[8];
    var b23 = b[9];
    var b33 = b[10];
    var b43 = b[11];
    var b14 = b[12];
    var b24 = b[13];
    var b34 = b[14];
    var b44 = b[15];

    r[o+0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    r[o+1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    r[o+2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    r[o+3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    r[o+4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    r[o+5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    r[o+6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    r[o+7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    r[o+8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    r[o+9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    r[o+10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    r[o+11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    r[o+12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
    r[o+13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
    r[o+14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
    r[o+15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

    return r;
};

/*
 * Function: M4x4.mulAffine
 *
 * Performs r = a * b, assuming a and b are affine (elements 3,7,11,15 = 0,0,0,1)
 *
 * Parameters:
 *
 *   a - the first matrix operand
 *   b - the second matrix operand
 *   r - optional 4x4 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 4x4 matrix with the result.
 */
M4x4.mulAffine = function M4x4_mulAffine(a, b, r) {
    MathUtils_assert(a.length == 16, "a.length == 16");
    MathUtils_assert(b.length == 16, "b.length == 16");
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");
    MathUtils_assert(a != r && b != r, "a != r && b != r");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);
    var a11 = a[0];
    var a21 = a[1];
    var a31 = a[2];
    var a12 = a[4];
    var a22 = a[5];
    var a32 = a[6];
    var a13 = a[8];
    var a23 = a[9];
    var a33 = a[10];
    var a14 = a[12];
    var a24 = a[13];
    var a34 = a[14];

    var b11 = b[0];
    var b21 = b[1];
    var b31 = b[2];
    var b12 = b[4];
    var b22 = b[5];
    var b32 = b[6];
    var b13 = b[8];
    var b23 = b[9];
    var b33 = b[10];
    var b14 = b[12];
    var b24 = b[13];
    var b34 = b[14];

    r[0] = a11 * b11 + a12 * b21 + a13 * b31;
    r[1] = a21 * b11 + a22 * b21 + a23 * b31;
    r[2] = a31 * b11 + a32 * b21 + a33 * b31;
    r[3] = 0;
    r[4] = a11 * b12 + a12 * b22 + a13 * b32;
    r[5] = a21 * b12 + a22 * b22 + a23 * b32;
    r[6] = a31 * b12 + a32 * b22 + a33 * b32;
    r[7] = 0;
    r[8] = a11 * b13 + a12 * b23 + a13 * b33;
    r[9] = a21 * b13 + a22 * b23 + a23 * b33;
    r[10] = a31 * b13 + a32 * b23 + a33 * b33;
    r[11] = 0;
    r[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14;
    r[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24;
    r[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34;
    r[15] = 1;

    return r;
};

/*
 * Function: M4x4.mulAffineOffset
 *
 * Performs r' = a * b, assuming a and b are affine (elements 3,7,11,15 = 0,0,0,1), where r' is the 16 elements of r starting at element o
 *
 * Parameters:
 *
 *   a - the first matrix operand
 *   b - the second matrix operand
 *   r - array to store the result in
 *   o - offset into r at which to start storing results
 *
 * Returns:
 *
 *   r
 */
M4x4.mulAffine = function M4x4_mulAffine(a, b, r, o) {
    MathUtils_assert(a.length == 16, "a.length == 16");
    MathUtils_assert(b.length == 16, "b.length == 16");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);
    var a11 = a[0];
    var a21 = a[1];
    var a31 = a[2];
    var a12 = a[4];
    var a22 = a[5];
    var a32 = a[6];
    var a13 = a[8];
    var a23 = a[9];
    var a33 = a[10];
    var a14 = a[12];
    var a24 = a[13];
    var a34 = a[14];

    var b11 = b[0];
    var b21 = b[1];
    var b31 = b[2];
    var b12 = b[4];
    var b22 = b[5];
    var b32 = b[6];
    var b13 = b[8];
    var b23 = b[9];
    var b33 = b[10];
    var b14 = b[12];
    var b24 = b[13];
    var b34 = b[14];

    r[o+0] = a11 * b11 + a12 * b21 + a13 * b31;
    r[o+1] = a21 * b11 + a22 * b21 + a23 * b31;
    r[o+2] = a31 * b11 + a32 * b21 + a33 * b31;
    r[o+3] = 0;
    r[o+4] = a11 * b12 + a12 * b22 + a13 * b32;
    r[o+5] = a21 * b12 + a22 * b22 + a23 * b32;
    r[o+6] = a31 * b12 + a32 * b22 + a33 * b32;
    r[o+7] = 0;
    r[o+8] = a11 * b13 + a12 * b23 + a13 * b33;
    r[o+9] = a21 * b13 + a22 * b23 + a23 * b33;
    r[o+10] = a31 * b13 + a32 * b23 + a33 * b33;
    r[o+11] = 0;
    r[o+12] = a11 * b14 + a12 * b24 + a13 * b34 + a14;
    r[o+13] = a21 * b14 + a22 * b24 + a23 * b34 + a24;
    r[o+14] = a31 * b14 + a32 * b24 + a33 * b34 + a34;
    r[o+15] = 1;

    return r;
};

/*
 * Function: M4x4.makeRotate
 *
 * Creates a transformation matrix for rotation by angle radians about the 3-element vector axis.
 *
 * Parameters:
 *
 *   angle - the angle of rotation, in radians
 *   axis - the axis around which the rotation is performed, a 3-element vector
 *   r - optional 4x4 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after creating the matrix.
 *   Otherwise, returns a new 4x4 matrix with the result.
 */
M4x4.makeRotate = function M4x4_makeRotate(angle, axis, r) {
    MathUtils_assert(angle.length == 3, "angle.length == 3");
    MathUtils_assert(axis.length == 3, "axis.length == 3");
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);

    axis = V3.normalize(axis, V3._temp1);
    var x = axis[0], y = axis[1], z = axis[2];
    var c = Math.cos(angle);
    var c1 = 1-c;
    var s = Math.sin(angle);

    r[0] = x*x*c1+c;
    r[1] = y*x*c1+z*s;
    r[2] = z*x*c1-y*s;
    r[3] = 0;
    r[4] = x*y*c1-z*s;
    r[5] = y*y*c1+c;
    r[6] = y*z*c1+x*s;
    r[7] = 0;
    r[8] = x*z*c1+y*s;
    r[9] = y*z*c1-x*s;
    r[10] = z*z*c1+c;
    r[11] = 0;
    r[12] = 0;
    r[13] = 0;
    r[14] = 0;
    r[15] = 1;

    return r;
};

/*
 * Function: M4x4.rotate
 *
 * Concatenates a rotation of angle radians about the axis to the give matrix m.
 *
 * Parameters:
 *
 *   angle - the angle of rotation, in radians
 *   axis - the axis around which the rotation is performed, a 3-element vector
 *   m - the matrix to concatenate the rotation to
 *   r - optional 4x4 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 4x4 matrix with the result.
 */
M4x4.rotate = function M4x4_rotate(angle, axis, m, r) {
    MathUtils_assert(angle.length == 3, "angle.length == 3");
    MathUtils_assert(axis.length == 3, "axis.length == 3");
    MathUtils_assert(m.length == 16, "m.length == 16");
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);
    var a0=axis [0], a1=axis [1], a2=axis [2];
    var l = Math.sqrt(a0*a0 + a1*a1 + a2*a2);
    var x = a0, y = a1, z = a2;
    if (l != 1.0) {
        var im = 1.0 / l;
        x *= im;
        y *= im;
        z *= im;
    }
    var c = Math.cos(angle);
    var c1 = 1-c;
    var s = Math.sin(angle);
    var xs = x*s;
    var ys = y*s;
    var zs = z*s;
    var xyc1 = x * y * c1;
    var xzc1 = x * z * c1;
    var yzc1 = y * z * c1;

    var m11 = m[0];
    var m21 = m[1];
    var m31 = m[2];
    var m41 = m[3];
    var m12 = m[4];
    var m22 = m[5];
    var m32 = m[6];
    var m42 = m[7];
    var m13 = m[8];
    var m23 = m[9];
    var m33 = m[10];
    var m43 = m[11];

    var t11 = x * x * c1 + c;
    var t21 = xyc1 + zs;
    var t31 = xzc1 - ys;
    var t12 = xyc1 - zs;
    var t22 = y * y * c1 + c;
    var t32 = yzc1 + xs;
    var t13 = xzc1 + ys;
    var t23 = yzc1 - xs;
    var t33 = z * z * c1 + c;

    r[0] = m11 * t11 + m12 * t21 + m13 * t31;
    r[1] = m21 * t11 + m22 * t21 + m23 * t31;
    r[2] = m31 * t11 + m32 * t21 + m33 * t31;
    r[3] = m41 * t11 + m42 * t21 + m43 * t31;
    r[4] = m11 * t12 + m12 * t22 + m13 * t32;
    r[5] = m21 * t12 + m22 * t22 + m23 * t32;
    r[6] = m31 * t12 + m32 * t22 + m33 * t32;
    r[7] = m41 * t12 + m42 * t22 + m43 * t32;
    r[8] = m11 * t13 + m12 * t23 + m13 * t33;
    r[9] = m21 * t13 + m22 * t23 + m23 * t33;
    r[10] = m31 * t13 + m32 * t23 + m33 * t33;
    r[11] = m41 * t13 + m42 * t23 + m43 * t33;
    if (r != m) {
        r[12] = m[12];
        r[13] = m[13];
        r[14] = m[14];
        r[15] = m[15];
    }
    return r;
};

/*
 * Function: M4x4.makeScale3
 *
 * Creates a transformation matrix for scaling by 3 scalar values, one for
 * each of the x, y, and z directions.
 *
 * Parameters:
 *
 *   x - the scale for the x axis
 *   y - the scale for the y axis
 *   z - the scale for the z axis
 *   r - optional 4x4 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after creating the matrix.
 *   Otherwise, returns a new 4x4 matrix with the result.
 */
M4x4.makeScale3 = function M4x4_makeScale3(x, y, z, r) {
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);

    r[0] = x;
    r[1] = 0;
    r[2] = 0;
    r[3] = 0;
    r[4] = 0;
    r[5] = y;
    r[6] = 0;
    r[7] = 0;
    r[8] = 0;
    r[9] = 0;
    r[10] = z;
    r[11] = 0;
    r[12] = 0;
    r[13] = 0;
    r[14] = 0;
    r[15] = 1;

    return r;
};

/*
 * Function: M4x4.makeScale1
 *
 * Creates a transformation matrix for a uniform scale by a single scalar value.
 *
 * Parameters:
 *
 *   k - the scale factor
 *   r - optional 4x4 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after creating the matrix.
 *   Otherwise, returns a new 4x4 matrix with the result.
 */
M4x4.makeScale1 = function M4x4_makeScale1(k, r) {
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    return M4x4.makeScale3(k, k, k, r);
};

/*
 * Function: M4x4.makeScale
 *
 * Creates a transformation matrix for scaling each of the x, y, and z axes by the amount
 * given in the corresponding element of the 3-element vector.
 *
 * Parameters:
 *
 *   v - the 3-element vector containing the scale factors
 *   r - optional 4x4 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after creating the matrix.
 *   Otherwise, returns a new 4x4 matrix with the result.
 */
M4x4.makeScale = function M4x4_makeScale(v, r) {
    MathUtils_assert(v.length == 3, "v.length == 3");
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    return M4x4.makeScale3(v[0], v[1], v[2], r);
};

/*
 * Function: M4x4.scale3
 */
M4x4.scale3 = function M4x4_scale3(x, y, z, m, r) {
    MathUtils_assert(m.length == 16, "m.length == 16");
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    if (r == m) {
        m[0] *= x;
        m[1] *= x;
        m[2] *= x;
        m[3] *= x;
        m[4] *= y;
        m[5] *= y;
        m[6] *= y;
        m[7] *= y;
        m[8] *= z;
        m[9] *= z;
        m[10] *= z;
        m[11] *= z;
        return m;
    }

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);

    r[0] = m[0] * x;
    r[1] = m[1] * x;
    r[2] = m[2] * x;
    r[3] = m[3] * x;
    r[4] = m[4] * y;
    r[5] = m[5] * y;
    r[6] = m[6] * y;
    r[7] = m[7] * y;
    r[8] = m[8] * z;
    r[9] = m[9] * z;
    r[10] = m[10] * z;
    r[11] = m[11] * z;
    r[12] = m[12];
    r[13] = m[13];
    r[14] = m[14];
    r[15] = m[15];

    return r;
};

/*
 * Function: M4x4.scale1
 */
M4x4.scale1 = function M4x4_scale1(k, m, r) {
    MathUtils_assert(m.length == 16, "m.length == 16");
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");
    if (r == m) {
        m[0] *= k;
        m[1] *= k;
        m[2] *= k;
        m[3] *= k;
        m[4] *= k;
        m[5] *= k;
        m[6] *= k;
        m[7] *= k;
        m[8] *= k;
        m[9] *= k;
        m[10] *= k;
        m[11] *= k;
        return m;
    }


    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);

    r[0] = m[0] * k;
    r[1] = m[1] * k;
    r[2] = m[2] * k;
    r[3] = m[3] * k;
    r[4] = m[4] * k;
    r[5] = m[5] * k;
    r[6] = m[6] * k;
    r[7] = m[7] * k;
    r[8] = m[8] * k;
    r[9] = m[9] * k;
    r[10] = m[10] * k;
    r[11] = m[11] * k;
    r[12] = m[12];
    r[13] = m[13];
    r[14] = m[14];
    r[15] = m[15];

    return r;
};

/*
 * Function: M4x4.scale1
 */
M4x4.scale = function M4x4_scale(v, m, r) {
    MathUtils_assert(v.length == 3, "v.length == 3");
    MathUtils_assert(m.length == 16, "m.length == 16");
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");
    var x = v[0], y = v[1], z = v[2];

    if (r == m) {
        m[0] *= x;
        m[1] *= x;
        m[2] *= x;
        m[3] *= x;
        m[4] *= y;
        m[5] *= y;
        m[6] *= y;
        m[7] *= y;
        m[8] *= z;
        m[9] *= z;
        m[10] *= z;
        m[11] *= z;
        return m;
    }

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);


    r[0] = m[0] * x;
    r[1] = m[1] * x;
    r[2] = m[2] * x;
    r[3] = m[3] * x;
    r[4] = m[4] * y;
    r[5] = m[5] * y;
    r[6] = m[6] * y;
    r[7] = m[7] * y;
    r[8] = m[8] * z;
    r[9] = m[9] * z;
    r[10] = m[10] * z;
    r[11] = m[11] * z;
    r[12] = m[12];
    r[13] = m[13];
    r[14] = m[14];
    r[15] = m[15];

    return r;
};

/*
 * Function: M4x4.makeTranslate3
 */
M4x4.makeTranslate3 = function M4x4_makeTranslate3(x, y, z, r) {
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);

    r[0] = 1;
    r[1] = 0;
    r[2] = 0;
    r[3] = 0;
    r[4] = 0;
    r[5] = 1;
    r[6] = 0;
    r[7] = 0;
    r[8] = 0;
    r[9] = 0;
    r[10] = 1;
    r[11] = 0;
    r[12] = x;
    r[13] = y;
    r[14] = z;
    r[15] = 1;

    return r;
};

/*
 * Function: M4x4.makeTranslate1
 */
M4x4.makeTranslate1 = function M4x4_makeTranslate1 (k, r) {
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    return M4x4.makeTranslate3(k, k, k, r);
};

/*
 * Function: M4x4.makeTranslate
 */
M4x4.makeTranslate = function M4x4_makeTranslate (v, r) {
    MathUtils_assert(v.length == 3, "v.length == 3");
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    return M4x4.makeTranslate3(v[0], v[1], v[2], r);
};

/*
 * Function: M4x4.translate3Self
 */
M4x4.translate3Self = function M4x4_translate3Self (x, y, z, m) {
    MathUtils_assert(m.length == 16, "m.length == 16");
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");
    m[12] += m[0] * x + m[4] * y + m[8] * z;
    m[13] += m[1] * x + m[5] * y + m[9] * z;
    m[14] += m[2] * x + m[6] * y + m[10] * z;
    m[15] += m[3] * x + m[7] * y + m[11] * z;
    return m;
};

/*
 * Function: M4x4.translate3
 */
M4x4.translate3 = function M4x4_translate3 (x, y, z, m, r) {
    MathUtils_assert(m.length == 16, "m.length == 16");
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    if (r == m) {
        m[12] += m[0] * x + m[4] * y + m[8] * z;
        m[13] += m[1] * x + m[5] * y + m[9] * z;
        m[14] += m[2] * x + m[6] * y + m[10] * z;
        m[15] += m[3] * x + m[7] * y + m[11] * z;
        return m;
    }

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);

    var m11 = m[0];
    var m21 = m[1];
    var m31 = m[2];
    var m41 = m[3];
    var m12 = m[4];
    var m22 = m[5];
    var m32 = m[6];
    var m42 = m[7];
    var m13 = m[8];
    var m23 = m[9];
    var m33 = m[10];
    var m43 = m[11];


    r[0] = m11;
    r[1] = m21;
    r[2] = m31;
    r[3] = m41;
    r[4] = m12;
    r[5] = m22;
    r[6] = m32;
    r[7] = m42;
    r[8] = m13;
    r[9] = m23;
    r[10] = m33;
    r[11] = m43;
    r[12] = m11 * x + m12 * y + m13 * z + m[12];
    r[13] = m21 * x + m22 * y + m23 * z + m[13];
    r[14] = m31 * x + m32 * y + m33 * z + m[14];
    r[15] = m41 * x + m42 * y + m43 * z + m[15];

    return r;
};

/*
 * Function: M4x4.translate1
 */
M4x4.translate1 = function M4x4_translate1 (k, m, r) {
    MathUtils_assert(m.length == 16, "m.length == 16");
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    return M4x4.translate3(k, k, k, m, r);
};
/*
 * Function: M4x4.translateSelf
 */
M4x4.translateSelf = function M4x4_translateSelf (v, m) {
    MathUtils_assert(v.length == 3, "v.length == 3");
    MathUtils_assert(m.length == 16, "m.length == 16");
    var x=v[0], y=v[1], z=v[2];
    m[12] += m[0] * x + m[4] * y + m[8] * z;
    m[13] += m[1] * x + m[5] * y + m[9] * z;
    m[14] += m[2] * x + m[6] * y + m[10] * z;
    m[15] += m[3] * x + m[7] * y + m[11] * z;
    return m;
};
/*
 * Function: M4x4.translate
 */
M4x4.translate = function M4x4_translate (v, m, r) {
    MathUtils_assert(v.length == 3, "v.length == 3");
    MathUtils_assert(m.length == 16, "m.length == 16");
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");
    var x=v[0], y=v[1], z=v[2];
    if (r == m) {
        m[12] += m[0] * x + m[4] * y + m[8] * z;
        m[13] += m[1] * x + m[5] * y + m[9] * z;
        m[14] += m[2] * x + m[6] * y + m[10] * z;
        m[15] += m[3] * x + m[7] * y + m[11] * z;
        return m;
    }

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);

    var m11 = m[0];
    var m21 = m[1];
    var m31 = m[2];
    var m41 = m[3];
    var m12 = m[4];
    var m22 = m[5];
    var m32 = m[6];
    var m42 = m[7];
    var m13 = m[8];
    var m23 = m[9];
    var m33 = m[10];
    var m43 = m[11];

    r[0] = m11;
    r[1] = m21;
    r[2] = m31;
    r[3] = m41;
    r[4] = m12;
    r[5] = m22;
    r[6] = m32;
    r[7] = m42;
    r[8] = m13;
    r[9] = m23;
    r[10] = m33;
    r[11] = m43;
    r[12] = m11 * x + m12 * y + m13 * z + m[12];
    r[13] = m21 * x + m22 * y + m23 * z + m[13];
    r[14] = m31 * x + m32 * y + m33 * z + m[14];
    r[15] = m41 * x + m42 * y + m43 * z + m[15];

    return r;
};

/*
 * Function: M4x4.makeLookAt
 */
M4x4.makeLookAt = function M4x4_makeLookAt (eye, center, up, r) {
    MathUtils_assert(eye.length == 3, "eye.length == 3");
    MathUtils_assert(center.length == 3, "center.length == 3");
    MathUtils_assert(up.length == 3, "up.length == 3");
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    var z = V3.direction(eye, center, V3._temp1);
    var x = V3.normalize(V3.cross(up, z, V3._temp2), V3._temp2);
    var y = V3.normalize(V3.cross(z, x, V3._temp3), V3._temp3);

    var tm1 = M4x4._temp1;
    var tm2 = M4x4._temp2;

    tm1[0] = x[0];
    tm1[1] = y[0];
    tm1[2] = z[0];
    tm1[3] = 0;
    tm1[4] = x[1];
    tm1[5] = y[1];
    tm1[6] = z[1];
    tm1[7] = 0;
    tm1[8] = x[2];
    tm1[9] = y[2];
    tm1[10] = z[2];
    tm1[11] = 0;
    tm1[12] = 0;
    tm1[13] = 0;
    tm1[14] = 0;
    tm1[15] = 1;

    tm2[0] = 1; tm2[1] = 0; tm2[2] = 0; tm2[3] = 0;
    tm2[4] = 0; tm2[5] = 1; tm2[6] = 0; tm2[7] = 0;
    tm2[8] = 0; tm2[9] = 0; tm2[10] = 1; tm2[11] = 0;
    tm2[12] = -eye[0]; tm2[13] = -eye[1]; tm2[14] = -eye[2]; tm2[15] = 1;

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);
    return M4x4.mul(tm1, tm2, r);
};

/*
 * Function: M4x4.transposeSelf
 */
M4x4.transposeSelf = function M4x4_transposeSelf (m) {
    MathUtils_assert(m.length == 16, "m.length == 16");
    var tmp = m[1]; m[1] = m[4]; m[4] = tmp;
    tmp = m[2]; m[2] = m[8]; m[8] = tmp;
    tmp = m[3]; m[3] = m[12]; m[12] = tmp;
    tmp = m[6]; m[6] = m[9]; m[9] = tmp;
    tmp = m[7]; m[7] = m[13]; m[13] = tmp;
    tmp = m[11]; m[11] = m[14]; m[14] = tmp;
    return m;
};
/*
 * Function: M4x4.transpose
 */
M4x4.transpose = function M4x4_transpose (m, r) {
    MathUtils_assert(m.length == 16, "m.length == 16");
    MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    if (m == r) {
        var tmp = 0.0;
        tmp = m[1]; m[1] = m[4]; m[4] = tmp;
        tmp = m[2]; m[2] = m[8]; m[8] = tmp;
        tmp = m[3]; m[3] = m[12]; m[12] = tmp;
        tmp = m[6]; m[6] = m[9]; m[9] = tmp;
        tmp = m[7]; m[7] = m[13]; m[13] = tmp;
        tmp = m[11]; m[11] = m[14]; m[14] = tmp;
        return m;
    }

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);

    r[0] = m[0]; r[1] = m[4]; r[2] = m[8]; r[3] = m[12];
    r[4] = m[1]; r[5] = m[5]; r[6] = m[9]; r[7] = m[13];
    r[8] = m[2]; r[9] = m[6]; r[10] = m[10]; r[11] = m[14];
    r[12] = m[3]; r[13] = m[7]; r[14] = m[11]; r[15] = m[15];

    return r;
};


/*
 * Function: M4x4.transformPoint
 */
M4x4.transformPoint = function M4x4_transformPoint (m, v, r) {
    MathUtils_assert(m.length == 16, "m.length == 16");
    MathUtils_assert(v.length == 3, "v.length == 3");
    MathUtils_assert(r == undefined || r.length == 3, "r == undefined || r.length == 3");
    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(3);

    var v0 = v[0], v1 = v[1], v2 = v[2];

    r[0] = m[0] * v0 + m[4] * v1 + m[8] * v2 + m[12];
    r[1] = m[1] * v0 + m[5] * v1 + m[9] * v2 + m[13];
    r[2] = m[2] * v0 + m[6] * v1 + m[10] * v2 + m[14];
    var w = m[3] * v0 + m[7] * v1 + m[11] * v2 + m[15];

    if (w != 1.0) {
        r[0] /= w;
        r[1] /= w;
        r[2] /= w;
    }

    return r;
};

/*
 * Function: M4x4.transformLine
 */
M4x4.transformLine = function M4x4_transformLine(m, v, r) {
    MathUtils_assert(m.length == 16, "m.length == 16");
    MathUtils_assert(v.length == 3, "v.length == 3");
    MathUtils_assert(r == undefined || r.length == 3, "r == undefined || r.length == 3");
    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(3);

    var v0 = v[0], v1 = v[1], v2 = v[2];
    r[0] = m[0] * v0 + m[4] * v1 + m[8] * v2;
    r[1] = m[1] * v0 + m[5] * v1 + m[9] * v2;
    r[2] = m[2] * v0 + m[6] * v1 + m[10] * v2;
    var w = m[3] * v0 + m[7] * v1 + m[11] * v2;

    if (w != 1.0) {
        r[0] /= w;
        r[1] /= w;
        r[2] /= w;
    }

    return r;
};


/*
 * Function: M4x4.transformPointAffine
 */
M4x4.transformPointAffine = function M4x4_transformPointAffine (m, v, r) {
    MathUtils_assert(m.length == 16, "m.length == 16");
    MathUtils_assert(v.length == 3, "v.length == 3");
    MathUtils_assert(r == undefined || r.length == 3, "r == undefined || r.length == 3");
    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(3);

    var v0 = v[0], v1 = v[1], v2 = v[2];

    r[0] = m[0] * v0 + m[4] * v1 + m[8] * v2 + m[12];
    r[1] = m[1] * v0 + m[5] * v1 + m[9] * v2 + m[13];
    r[2] = m[2] * v0 + m[6] * v1 + m[10] * v2 + m[14];

    return r;
};

/*
 * Function: M4x4.transformLineAffine
 */
M4x4.transformLineAffine = function M4x4_transformLineAffine(m, v, r) {
    MathUtils_assert(m.length == 16, "m.length == 16");
    MathUtils_assert(v.length == 3, "v.length == 3");
    MathUtils_assert(r == undefined || r.length == 3, "r == undefined || r.length == 3");
    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(3);

    var v0 = v[0], v1 = v[1], v2 = v[2];
    r[0] = m[0] * v0 + m[4] * v1 + m[8] * v2;
    r[1] = m[1] * v0 + m[5] * v1 + m[9] * v2;
    r[2] = m[2] * v0 + m[6] * v1 + m[10] * v2;

    return r;
};

// for AMD shimming:
var mjs = {
  FLOAT_ARRAY_TYPE: MJS_FLOAT_ARRAY_TYPE,
  V3: V3,
  M4x4: M4x4
};

return mjs;
});

// assign base properites to shrike
define('base',[

  'underscore',
  'mjs'

], function(_, mjs) {
  

  return function(shrike) {

    // borrow all of Math's functions and constants... except round since shrike provides its own round function
    _.without(Object.getOwnPropertyNames(Math), 'round').forEach(function(prop) {
      shrike.register(prop, Math[prop]);
    });

    // borrow mjs too
    Object.getOwnPropertyNames(mjs).forEach(function(prop) {
      shrike.register(prop, mjs[prop]);
    });

    // alias M4x4 to M4 since it is shorter to type
    shrike.alias('M4', 'M4x4');
  }
});

// things common to both M4, V3 or all arrays in general
define('common',[

  'underscore'

], function(_) {
  

  return function(shrike) {

    // sum an array
    shrike.register('sum', function(arr) {
      shrike.assert(shrike.isArray(arr), 'can\'t compute sum of non-array ' + arr);

      return _.reduce(shrike.toFloat(arr), function(memo, num) {
        if (!shrike.isNumber(num)) {
          shrike.throwError('can\'t compute sum of array with non numeric element: ' + num);
        }

        return memo + num;
      }, 0.0);
    });

    shrike.register('square', function(x) {
      shrike.assert(shrike.isNumber(x), 'can\'t square non numeric element: ' + x);
      return parseFloat(x) * parseFloat(x);
    });

    shrike.register('round', function(n, dec) {
      dec = dec || 0;

      shrike.assert(dec <= 20, 'round: can only round to 20 decimal places');
      shrike.assert(shrike.isNumber(n), 'round: ' + n + ' is not a numeric type');

      return parseFloat(new Number(n + '').toFixed(parseInt(dec)));
    });

    shrike.register('roundArray', function(A, dec) {
      shrike.throwError(shrike.isArray(A), 'roundArray: not an array');
      return shrike.scalarIterator(A, function(a) {
        return shrike.round(a, dec);
      });
    });
  }
});

// data conversion
define('converters',[

  'underscore'

], function(_) {
  

  return function(shrike) {

    shrike.register('toFloat', function(thing) {

      // its a number
      if (shrike.isNumber(thing)) {
        return parseFloat(thing);
      }

      // its already floating point
      else if (shrike.isNativeFloatArray(thing)) {
        return thing;
      }

      // its an array
      else if (shrike.isArray(thing)) {

        var _convert = function(thing) {
          shrike.assert(shrike.isNumber(thing), 'toFloat: array has something in it that is not a number: ' + thing);

          return parseFloat(thing);
        };

        // its a 2d array
        if (shrike.is2DArray(thing)) {
          return _.map(thing, function(row) {
            return _.map(row, _convert);
          });
        }
        else {
          return _.map(thing, _convert);
        }
      }
      else {
        shrike.throwError('toFloat: can not convert to float: ' + thing);
      }
    });

    /* return a scale so that X source * scale = Y target */
    /* this function mirrors GetUnitConversionScale in mujin/dev/mujin/__init__.py */
    shrike.register('unitConversionScale', function(sourceUnit, targetUnit) {
      var unitDict = {
        m: 1.0,
        meter: 1.0,
        cm: 100.0,
        mm: 1000.0,
        um: 1e6,
        nm: 1e9,
        inch: 39.370078740157481,
        in : 39.370078740157481
      };
      var units = _.keys(unitDict);

      shrike.assert(_.contains(units, targetUnit) && _.contains(units, sourceUnit), 'no conversion for either ' + sourceUnit + ' or ' + targetUnit);

      return parseFloat(unitDict[targetUnit] / unitDict[sourceUnit]);
    });

    shrike.register('toDegrees', function(x) {
      var _convert = function(n) {
        shrike.assert(shrike.isNumber(n), 'toDegrees: not a number');
        if (shrike.abs(n) <= 1e-10) {
          return 0.0;
        }
        else {
          return (180.0 / shrike.PI) * n;
        }
      };

      if (shrike.isNumber(x)) {
        return _convert(x);
      }
      else {
        return shrike.scalarIterator(x, _convert);
      }
    });

    shrike.register('toRadians', function(x) {
      var _convert = function(n) {
        shrike.assert(shrike.isNumber(n), 'toRadians: not a number');
        return (shrike.PI / 180.0) * n;
      };

      if (shrike.isNumber(x)) {
        return _convert(x);
      }
      else {
        return shrike.scalarIterator(x, _convert);
      }
    });

    // parses an axis and an angle from some arguments
    // input can be an object with axis and angle properties
    // or an array of 3 values for the axis and an angle as the second argument
    // or an array of 4 values, first three being axis and the last one angle
    shrike.register('parseAxisAngle', function(axis, angle) {
      var _axis;
      var _angle;
      var _throwError = function() {
        shrike.throwError('parseAxisAngle: arguments were not something we recognized');
      };

      if (shrike.isArray(axis)) {
        if (axis.length == 4 && angle === undefined) {
          _axis = axis.slice(0, 3);
          _angle = axis[3];
        }
        else if (axis.length == 3 && angle !== undefined) {
          _axis = axis;
          _angle = angle;
        }
        else {
          _throwError();
        }
      }
      else if (_.isObject(axis) && angle === undefined) {
        if (axis.hasOwnProperty('axis') && axis.hasOwnProperty('angle')) {
          _axis = axis.axis;
          _angle = axis.angle;
        }
        else {
          _throwError();
        }
      }
      else {
        _throwError();
      }
      return {
        axis: shrike.toFloat(_axis),
        angle: shrike.toFloat(_angle)
      };
    });

    // convert a quaternion from axis angle (radians)
    shrike.register('quatFromAxisAngle', function(_axis, _angle) {
      var aa = shrike.parseAxisAngle(_axis, _angle);
      var axis = aa.axis;
      var angle = aa.angle;

      var axisLength = shrike.sum(_.map(axis, shrike.square));
      if (axisLength <= 1e-10) {
        return [1.0, 0.0, 0.0, 0.0];
      }
      var halfangle = angle / 2.0;
      var sinangle = Math.sin(halfangle) / Math.sqrt(axisLength);

      // TODO: return a float array
      return [Math.cos(halfangle), axis[0] * sinangle, axis[1] * sinangle, axis[2] * sinangle];
    });

    shrike.register('quatFromMatrix', function(Traw) {

      var T = shrike.toFloat(Traw);

      var tr = T[0][0] + T[1][1] + T[2][2];
      var rot = [0.0, 0.0, 0.0, 0.0];
      if (tr >= 0.0) {
        rot[0] = tr + 1.0;
        rot[1] = (T[2][1] - T[1][2]);
        rot[2] = (T[0][2] - T[2][0]);
        rot[3] = (T[1][0] - T[0][1]);
      }
      else {

        // find the largest diagonal element and jump to the appropriate case
        if (T[1][1] > T[0][0]) {
          if (T[2][2] > T[1][1]) {
            rot[3] = (T[2][2] - (T[0][0] + T[1][1])) + 1.0;
            rot[1] = (T[2][0] + T[0][2]);
            rot[2] = (T[1][2] + T[2][1]);
            rot[0] = (T[1][0] - T[0][1]);
          }
          else {
            rot[2] = (T[1][1] - (T[2][2] + T[0][0])) + 1.0;
            rot[3] = (T[1][2] + T[2][1]);
            rot[1] = (T[0][1] + T[1][0]);
            rot[0] = (T[0][2] - T[2][0]);
          }
        }
        else if (T[2][2] > T[0][0]) {
          rot[3] = (T[2][2] - (T[0][0] + T[1][1])) + 1.0;
          rot[1] = (T[2][0] + T[0][2]);
          rot[2] = (T[1][2] + T[2][1]);
          rot[0] = (T[1][0] - T[0][1]);
        }
        else {
          rot[1] = (T[0][0] - (T[1][1] + T[2][2])) + 1.0;
          rot[2] = (T[0][1] + T[1][0]);
          rot[3] = (T[2][0] + T[0][2]);
          rot[0] = (T[2][1] - T[1][2]);
        }
      }

      return shrike.divide(rot, shrike.magnitude(rot));
    });

    shrike.register('matrixFromQuat', function(quatRaw) {
      var quat = shrike.toFloat(quatRaw);

      var length2 = shrike.square(shrike.magnitude(quat));
      if (length2 <= 1e-8) {

        // invalid quaternion, so return identity
        return m.eye(4);
      }
      var ilength2 = 2.0 / length2;

      var qq1 = ilength2 * quat[1] * quat[1];
      var qq2 = ilength2 * quat[2] * quat[2];
      var qq3 = ilength2 * quat[3] * quat[3];

      var T = shrike.eye(4);

      T[0][0] = 1.0 - qq2 - qq3;
      T[0][1] = ilength2 * (quat[1] * quat[2] - quat[0] * quat[3]);
      T[0][2] = ilength2 * (quat[1] * quat[3] + quat[0] * quat[2]);
      T[1][0] = ilength2 * (quat[1] * quat[2] + quat[0] * quat[3]);
      T[1][1] = 1.0 - qq1 - qq3;
      T[1][2] = ilength2 * (quat[2] * quat[3] - quat[0] * quat[1]);
      T[2][0] = ilength2 * (quat[1] * quat[3] - quat[0] * quat[2]);
      T[2][1] = ilength2 * (quat[2] * quat[3] + quat[0] * quat[1]);
      T[2][2] = 1.0 - qq1 - qq2;

      return T;
    });

    // angle is returned in radians
    shrike.register('axisAngleFromQuat', function(quatraw) {

      var quat = shrike.toFloat(quatraw);
      var sinang = shrike.sum(_.map(quat.slice(1, 4), shrike.square));

      var identity = {
        axis: [1.0, 0.0, 0.0],
        angle: 0.0
      };
      if (sinang === 0.0) {
        return identity;
      }
      else if (quat[0] * quat[0] + sinang <= 1e-8) {
        throw new Error('invalid quaternion ' + quat);
      }
      var _quat;
      if (quat[0] < 0.0) {
        _quat = [-quat[0], -quat[1], -quat[2], -quat[3]];
      }
      else {
        _quat = quat;
      }
      sinang = Math.sqrt(sinang);
      var f = 1.0 / sinang;

      var angle = 2.0 * Math.atan2(sinang, _quat[0]);
      return {
        axis: [_quat[1] * f, _quat[2] * f, _quat[3] * f],
        angle: angle
      };
    });

    shrike.register('axisAngleFromMatrix', function(m) {
      return shrike.axisAngleFromQuat(shrike.quatFromMatrix(m));
    });

    shrike.register('zxyFromMatrix', function(Traw) {

      var T = shrike.matrix4to3(shrike.toFloat(Traw));

      var epsilon = 1e-10;

      var x, y, z;
      if ((Math.abs(T[2][0]) < epsilon) && (Math.abs(T[2][2]) < epsilon)) {
        var sinx = T[2][1];
        if (sinx > 0.0) {
          x = Math.PI / 2.0;
        }
        else {
          x = -Math.PI / 2.0;
        }
        z = 0.0;
        y = Math.atan2(sinx * T[1][0], T[0][0]);
      }
      else {
        y = Math.atan2(-T[2][0], T[2][2]);
        var siny = Math.sin(y);
        var cosy = Math.cos(y);
        var Ryinv = [
        [cosy, 0.0, -siny],
        [0.0, 1.0, 0.0],
        [siny, 0.0, cosy]
      ];
        var Rzx = shrike.matrixMult(T, Ryinv);
        x = Math.atan2(Rzx[2][1], Rzx[2][2]);
        z = Math.atan2(Rzx[1][0], Rzx[0][0]);
      }
      return shrike.toDegrees([x, y, z]);
    });

    shrike.register('zyxFromMatrix', function(Traw) {
      var T = shrike.toFloat(Traw);
      var epsilon = 1e-10;
      var x, y, z;

      if ((Math.abs(T[2][1]) < epsilon) && (Math.abs(T[2][2]) < epsilon)) {
        if (T[2][0] <= 0.0) {
          y = Math.PI / 2.0;
        }
        else {
          y = -Math.PI / 2.0;
        }
        if (y > 0.0) {
          var xminusz = Math.atan2(T[0][1], T[1][1]);
          x = xminusz;
          z = 0.0;
        }
        else {
          var xplusz = -Math.atan2(T[0][1], T[1][1]);
          x = xplusz;
          z = 0.0;
        }
      }
      else {
        x = Math.atan2(T[2][1], T[2][2]);
        var sinx = Math.sin(x);
        var cosx = Math.cos(x);
        var Rxinv = [[1.0, 0.0, 0.0], [0.0, cosx, sinx], [0.0, -sinx, cosx]];
        var Rzy = shrike.matrixMult(shrike.matrix4to3(T), Rxinv);
        y = Math.atan2(-Rzy[2][0], Rzy[2][2]);
        z = Math.atan2(-Rzy[0][1], Rzy[1][1]);
      }

      return shrike.toDegrees([x, y, z]);
    });

    shrike.register('matrixFromZXY', function(ZXY) {

      var x = shrike.toRadians(parseFloat(ZXY[0]));
      var y = shrike.toRadians(parseFloat(ZXY[1]));
      var z = shrike.toRadians(parseFloat(ZXY[2]));
      return [
      [
        -Math.sin(x) * Math.sin(y) * Math.sin(z) + Math.cos(y) * Math.cos(z),
        -Math.sin(z) * Math.cos(x),
        Math.sin(x) * Math.sin(z) * Math.cos(y) + Math.sin(y) * Math.cos(z)
      ], [
        Math.sin(x) * Math.sin(y) * Math.cos(z) + Math.sin(z) * Math.cos(y),
        Math.cos(x) * Math.cos(z),
        -Math.sin(x) * Math.cos(y) * Math.cos(z) + Math.sin(y) * Math.sin(z)
      ], [
        -Math.sin(y) * Math.cos(x),
        Math.sin(x),
        Math.cos(x) * Math.cos(y)
      ]
        ];
    });

    shrike.register('matrixFromZYX', function(ZYX) {
      var x = shrike.toRadians(parseFloat(ZYX[0]));
      var y = shrike.toRadians(parseFloat(ZYX[1]));
      var z = shrike.toRadians(parseFloat(ZYX[2]));
      return [
      [
        Math.cos(y) * Math.cos(z),
        -Math.cos(x) * Math.sin(z) + Math.cos(z) * Math.sin(x) * Math.sin(y),
        Math.sin(x) * Math.sin(z) + Math.cos(x) * Math.cos(z) * Math.sin(y)
      ], [
        Math.cos(y) * Math.sin(z),
        Math.cos(x) * Math.cos(z) + Math.sin(x) * Math.sin(y) * Math.sin(z),
        -Math.cos(z) * Math.sin(x) + Math.cos(x) * Math.sin(y) * Math.sin(z)
      ], [
        -Math.sin(y),
        Math.cos(y) * Math.sin(x),
        Math.cos(x) * Math.cos(y)
      ]
        ];
    });

    shrike.register('zxyFromQuat', function(quat) {
      return shrike.zxyFromMatrix(shrike.matrixFromQuat(shrike.toFloat(quat)));
    });

    shrike.register('quatFromZXY', function(zxy) {
      return shrike.quatFromMatrix(shrike.matrixFromZXY(shrike.toFloat(zxy)));
    });

    shrike.register('zyxFromQuat', function(quat) {
      return shrike.zyxFromMatrix(shrike.matrixFromQuat(shrike.toFloat(quat)));
    });

    shrike.register('quatFromZYX', function(zyx) {
      return shrike.quatFromMatrix(shrike.matrixFromZYX(shrike.toFloat(zyx)));
    });

    // carves out the 3x3 rotation matrix out of a 3x4 or 4x4 transform
    shrike.register('matrix4to3', function(M) {
      return [[M[0][0], M[0][1], M[0][2]], [M[1][0], M[1][1], M[1][2]], [M[2][0], M[2][1], M[2][2]]];
    });

    shrike.register('composeTransformArray', function(rot, trans) {
      return [[rot[0][0], rot[0][1], rot[0][2], trans[0]], [rot[1][0], rot[1][1], rot[1][2], trans[1]], [rot[2][0], rot[2][1], rot[2][2], trans[2]], [0.0, 0.0, 0.0, 1.0]];
    });

    shrike.register('decomposeTransformArray', function(T) {
      return {
        rotationMatrix: [T[0].slice(0, 3), T[1].slice(0, 3), T[2].slice(0, 3)],
        translation: [T[0][3], T[1][3], T[2][3]]
      };
    });

    // TODO move into M4 namespace as toTransformArray and fromTransformArray
    shrike.register('M4toTransformArray', function(m) {
      return [[m[0], m[4], m[8], m[12]], [m[1], m[5], m[9], m[13]], [m[2], m[6], m[10], m[14]], [m[3], m[7], m[11], m[15]]];
    });

    shrike.register('transformArrayToM4', function(m) {
      return [m[0][0], m[1][0], m[2][0], m[3][0], m[0][1], m[1][1], m[2][1], m[3][1], m[0][2], m[1][2], m[2][2], m[3][2], m[0][3], m[1][3], m[2][3], m[3][3]];
    });
  }
});

// common matrix operations
define('matrix',[

  'underscore'

], function(_) {
  

  return function(shrike) {

    shrike.register('divide', function(A, scalar) {
      return shrike.scalarIterator(shrike.toFloat(A), function(a) {
        return a / parseFloat(scalar);
      });
    });

    // identity matrix
    // returns an m x n identity matrix
    // if you leave out n, it will be an m x m matrix
    shrike.register('eye', function(m, n) {
      n = n || m;
      var ret = [];
      for (var i = 0; i < n; i++) {
        var row = [];
        for (var j = 0; j < m; j++) {
          if (i == j) {
            row.push(1.0);
          }
          else {
            row.push(0.0);
          }
        }
        ret.push(row);
      }
      return ret;
    });

    shrike.register('magnitude', function(a) {
      if (shrike.isNativeFloatArray(a)) {
        shrike.assert(a.length === 3, 'magnitude: native float array\'s need to be of length three');
        return shrike.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
      }
      return shrike.sqrt(shrike.sum(_.map(shrike.toFloat(a), shrike.square)));
    });

    shrike.alias('norm', 'magnitude');

    shrike.register('normalize', function(array) {
      var length = shrike.magnitude(array);
      shrike.assert(length !== 0, 'normalize: trying to normalize a zero array');
      return shrike.divide(array, length);
    });

    shrike.register('matrixMult', function(_A, _B) {
      var A = shrike.toFloat(_A);
      var B = shrike.toFloat(_B);

      shrike.assert(A[0].length === A.length, 'matrixMult: incompatible array sizes!');

      var result = [];
      for (var i = 0; i < A.length; i++) {
        var row = [];
        for (var j = 0; j < B[i].length; j++) {
          var sum = 0;
          for (var k = 0; k < A[i].length; k++) {
            sum += A[i][k] * B[k][j];
          }
          row.push(sum);
        }
        result.push(row);
      }

      return result;
    });
  }
});

// functions to augment mjs's V3 vector
define('V3',[

  'underscore',
  'mjs'

], function(_, mjs) {
  

  return function(shrike) {

    shrike.register('V3.objectToArray', function(o) {
      shrike.assert(_.isObject(o), 'not an object');
      return ['x', 'y', 'z'].map(function(p) {
        return o[p];
      });
    });

    shrike.register('V3.arrayToObject', function(_v) {
      shrike.assert(shrike.isArray(_v), 'not an array');
      var v = shrike.toFloat(_v);
      return _.object(['x', 'y', 'z'], v);
    });
  };
});

// functions to augment mjs's 4x4 matrix
define('M4',[

  'underscore',
  'mjs'

], function(_, mjs) {
  

  return function(shrike) {

    shrike.register('M4.matrixFromQuat', function(quatRaw) {
      shrike.assert(quatRaw.length === 4, 'M4.matrixFromQuat: quatRaw.length !== 4');
      var quat = shrike.toFloat(quatRaw);
      var r = shrike.M4.clone(shrike.M4.I);

      var length2 = shrike.sum(_.map(quat, shrike.square));
      if (length2 <= 1e-8) {

        // invalid quaternion, so return identity
        return r;
      }
      var ilength2 = 2.0 / length2;

      var qq1 = ilength2 * quat[1] * quat[1];
      var qq2 = ilength2 * quat[2] * quat[2];
      var qq3 = ilength2 * quat[3] * quat[3];

      r[0] = 1.0 - qq2 - qq3;
      r[1] = ilength2 * (quat[1] * quat[2] + quat[0] * quat[3]);
      r[2] = ilength2 * (quat[1] * quat[3] - quat[0] * quat[2]);

      r[4] = ilength2 * (quat[1] * quat[2] - quat[0] * quat[3]);
      r[5] = 1.0 - qq1 - qq3;
      r[6] = ilength2 * (quat[2] * quat[3] + quat[0] * quat[1]);

      r[8] = ilength2 * (quat[1] * quat[3] + quat[0] * quat[2]);
      r[9] = ilength2 * (quat[2] * quat[3] - quat[0] * quat[1]);
      r[10] = 1.0 - qq1 - qq2;

      return r;
    });

    shrike.register('M4.quatFromMatrix', function(_m) {

      var m = shrike.toFloat(_m);

      var m11 = m[0];
      var m21 = m[1];
      var m31 = m[2];
      // var m41 = m[3];
      var m12 = m[4];
      var m22 = m[5];
      var m32 = m[6];
      // var m42 = m[7];
      var m13 = m[8];
      var m23 = m[9];
      var m33 = m[10];
      // var m43 = m[11];
      // var m14 = m[12];
      // var m24 = m[13];
      // var m34 = m[14];
      // var m44 = m[15];

      var tr = m11 + m22 + m33;
      var r = [0.0, 0.0, 0.0, 0.0];
      if (tr >= 0.0) {
        r[0] = tr + 1.0;
        r[1] = (m32 - m23);
        r[2] = (m13 - m31);
        r[3] = (m21 - m12);
      }
      else {

        // find mhe largesm diagonal elemenm and jump mo mhe appropriame case
        if (m22 > m11) {
          if (m33 > m22) {
            r[3] = (m33 - (m11 + m22)) + 1.0;
            r[1] = (m31 + m13);
            r[2] = (m23 + m32);
            r[0] = (m21 - m12);
          }
          else {
            r[2] = (m22 - (m33 + m11)) + 1.0;
            r[3] = (m23 + m32);
            r[1] = (m12 + m21);
            r[0] = (m13 - m31);
          }
        }
        else if (m33 > m11) {
          r[3] = (m33 - (m11 + m22)) + 1.0;
          r[1] = (m31 + m13);
          r[2] = (m23 + m32);
          r[0] = (m21 - m12);
        }
        else {
          r[1] = (m11 - (m22 + m33)) + 1.0;
          r[2] = (m12 + m21);
          r[3] = (m31 + m13);
          r[0] = (m32 - m23);
        }
      }

      return shrike.divide(r, shrike.magnitude(r));
    });

    shrike.register('M4.transFromMatrix', function(m) {
      // var r = new shrike.FLOAT_ARRAY_TYPE(3);

      // TODO use native array type here...
      var r = new Array(3);
      r[0] = m[12];
      r[1] = m[13];
      r[2] = m[14];
      return r;
    });

    // composes an instance from a quaternion and translation V3
    shrike.register('M4.composeFromQuatTrans', function(quatRaw, transRaw) {
      var r = shrike.M4.matrixFromQuat(quatRaw);

      var trans = shrike.toFloat(transRaw);

      shrike.assert(trans.length === 3, 'M4.composeFromQuatTrans: trans.length !== 3');

      r[12] = trans[0];
      r[13] = trans[1];
      r[14] = trans[2];

      return r;
    });
  }
});

define('tween',[

  'underscore'

], function(_) {
  

  return function(shrike) {

    // requires t0, t1 to be distinct
    shrike.register('linearlyInterpolate', function(t0, x0, t1, x1, t) {
      return (x0 * (t1 - t) + x1 * (t - t0)) / (t1 - t0);
    });
  }
});

define('shrike',[

  'underscore',
  './utils',
  './iterators',
  './base',
  './common',
  './converters',
  './matrix',
  './V3',
  './M4',
  './tween'

], function(_, utils, iterators, base, common, converters, matrix, V3, M4, tween) {
  

  var shrike = {};

  utils(shrike);
  iterators(shrike);
  base(shrike);
  common(shrike);
  converters(shrike);
  matrix(shrike);
  V3(shrike);
  M4(shrike);
  tween(shrike);

  // for debugging / console convenience
  if (window.makeGlobal !== undefined) {
    window.makeGlobal(shrike);
    window.makeGlobal({
      math: shrike,
      shrike: shrike
    });
  }

  return shrike;
});
