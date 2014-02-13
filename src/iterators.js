define([

  'underscore'

], function(_) {
  'use strict';

  return function(shrike) {

    // deep recurse through an n dimentional array and apply a function to every element
    // maybe get rid of this? its not being used anywhere because shrike.scalarIterator is faster
    // and simpler, but it only handles things up to 2 dimensions
    shrike.register('recursiveIterator', function(x, _function) {
      _function = _function || pass;
      if (!shrike.isArray(x)) {
        return _function(parseFloat(x));
      }
      else if (shrike.isArray(x) && x.length == 1) {
        return [_function(parseFloat(x[0]))];
      }
      // avoid recursing into strings by making them floats
      else if (_.isString(x)) {
        return _function(parseFloat(x));
      }
      else {
        return x.map(function(value) {
          return shrike.recursiveIterator(value, _function);
        });
      }
    });

    // traverse through two transforms and call a function that recives an element from both arrays
    shrike.register('elementWiseIterator', function(A, B, _function) {
      _function = _function || pass;
      if (!shrike.isArray(A) || !shrike.isArray(B) || A.length != B.length) {
        throw new Error('trying to do an element-wise operation on unequal sized arrays or something thats not an array!');
      }
      else {
        var ret = [];
        for (var i = 0; i < A.length; i++) {
          if (shrike.isArray(A[i]) && shrike.isArray(B[i]) && A[i].length == B[i].length) {
            var row = [];
            for (var j = 0; j < A[i].length; j++) {
              row.push(_function(parseFloat(A[i][j]), parseFloat(B[i][j])));
            }
            ret.push(row);
          }
          else {
            ret.push(_function(parseFloat(A[i]), parseFloat(B[i])));
          }
        }
        return ret;
      }
    });

    // applies a function to every element in A
    // input can be a string, integer, 1d or 2d array
    // if its a string or integer, the function will just be called once
    shrike.register('scalarIterator', function(A, _function) {
      _function = _function || pass;
      if (shrike.isArray(A)) {
        return A.map(function(B) {
          if (shrike.isArray(B)) {
            return B.map(function(b) {
              return _function(parseFloat(b));
            });
          }
          else {
            return _function(parseFloat(B));
          }
        });
      }
      else {
        return _function(parseFloat(A));
      }
    });
  }
});
