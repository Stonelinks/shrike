define([

  'underscore',
  'mjs'

], function(_, mjs) {
  'use strict';

  return function(shrike) {

    // borrow all of Math's functions and constants... except round since it is defined below
    _.without(Object.getOwnPropertyNames(Math), 'round').forEach(function(prop) {
      shrike.register(prop, Math[prop]);
    });

    // borrow mjs too
    Object.getOwnPropertyNames(mjs).forEach(function(prop) {
      shrike.register(prop, mjs[prop]);
    });

    // sum an array
    shrike.register('sum', function(arr) {
      if (!shrike.isArray(arr)) {
        shrike.throwError('can\'t compute sum of non-array ' + arr);
      }
      else {
        if (arr.length > 0 && shrike.isArray(arr[0])) {
          shrike.throwError('can\'t compute sum of >1d arrays');
        }
        else {
          return _.reduce(shrike.toFloat(arr), function(memo, num) {
            return memo + num;
          }, 0.0);
        }
      }
    });

    shrike.register('square', function(x) {
      return parseFloat(x) * parseFloat(x);
    });

    shrike.register('xround', function(num, dec) {
      dec = dec || 0.0;
      // works to 20 decimal points

      return shrike.scalarIterator(num, function(a) {
        return parseFloat(new Number(a + '').toFixed(parseInt(dec)));
      });
    });

    shrike.register('round', function(n, dec) {
      dec = dec || 0;

      // works to 20 decimal points
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
