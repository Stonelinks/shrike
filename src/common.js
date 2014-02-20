// things common to both M4, V3 or all arrays in general
define([

  'underscore'

], function(_) {
  'use strict';

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
