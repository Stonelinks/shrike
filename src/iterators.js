// various ways of iterating through arrays
define([

  'underscore'

], function(_) {
  'use strict';

  return function(shrike) {

    // applies a function to every element in A
    // input can be a string, integer, 1d or 2d array
    // if its a string or integer, the function will just be called once
    shrike.register('scalarIterator', function(A, _function) {
      _function = _function || pass;
      if (shrike.is2DArray(A)) {
        return A.map(function(element) {
          return element.map(_function);
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
          return A.map(_function);
        }
      }
      else {
        return _function(A);
      }
    });
  }
});
