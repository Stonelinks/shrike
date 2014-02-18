// things common to both M4, V3 or all arrays in general
define([

  'underscore'

], function(_) {
  'use strict';

  return function(shrike) {

    // sum an array
    shrike.register('sum', function(arr) {
      if (!shrike.isArray(arr)) {
        shrike.throwError('can\'t compute sum of non-array ' + arr);
      }
      else {
        return _.reduce(shrike.toFloat(arr), function(memo, num) {
          if (!shrike.isNumber(num)) {
            shrike.throwError('can\'t compute sum of array with non numeric element: ' + num);
          }

          return memo + num;
        }, 0.0);
      }
    });

    shrike.register('square', function(x) {
      if (!shrike.isNumber(x)) {
        shrike.throwError('can\'t square non numeric element: ' + num);
      }

      return parseFloat(x) * parseFloat(x);
    });

    shrike.register('round', function(n, dec) {
      dec = dec || 0;

      if (dec >= 20) {
        shrike.throwError('round: can only round to 20 decimal places');
      }

      if (shrike.isNumber(n)) {
        return parseFloat(new Number(n + '').toFixed(parseInt(dec)));
      }
      else {
        shrike.throwError('round: ' + n + ' is not a numeric type');
      }
    });

    shrike.register('roundArray', function(A, dec) {
      if (shrike.isArray(A)) {
        return shrike.scalarIterator(A, function(a) {
          return shrike.round(a, dec);
        });
      }
      else {
        shrike.throwError('roundArray: not an array');
      }
    });
  }
});
