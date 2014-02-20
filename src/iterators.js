// various ways of iterating through arrays
define([

  'underscore'

], function(_) {
  'use strict';

  return function(shrike) {

    // traverse through two transforms and call a function that recives an element from both arrays
    shrike.register('elementWiseIterator', function(A, B, _function) {
      _function = _function || pass;

      if (!shrike.isArray(A) || !shrike.isArray(B)) {
        console.warn('elementWiseIterator: one of these is not an array: %o and %o', A, B);
        shrike.throwError();
      }

      shrike.assert(A.length === B.length, 'elementWiseIterator: trying to do an element-wise operation on unequal sized arrays');

      var is2d = false;
      if (shrike.is2DArray(A)) {
        if (shrike.is2DArray(B)) {
          is2d = true;
        }
        else {
          console.warn('elementWiseIterator: one of these is a 2d array and the other is not: %o and %o', A, B);
          shrike.throwError();
        }
      }

      // actially iterate
      var ret = [];
      for (var i = 0; i < A.length; i++) {
        if (is2d) {
          shrike.assert(A[i].length === B[i].length, 'elementWiseIterator: unequal row lengths while iterating through 2d array');
          var row = [];
          for (var j = 0; j < A[i].length; j++) {
            row.push(_function(A[i][j], B[i][j]));
          }
          ret.push(row);
        }
        else {
          ret.push(_function(A[i], B[i]));
        }
      }
      return ret;
    });

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
        return A.map(_function);
      }
      else {
        return _function(A);
      }
    });
  }
});
