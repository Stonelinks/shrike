define([

  'underscore'

], function(_) {
  'use strict';

  return function(shrike) {

    // borrow all of Math's functions and constants... except round since it is defined below
    _.without(Object.getOwnPropertyNames(Math), 'round').forEach(function(prop) {
      shrike.register(prop, Math[prop]);
    });

    // sum an array
    shrike.register('sum', function(arr) {
      return _.reduce(shrike.toFloat(arr), function(memo, num) {
        return memo + num;
      }, 0.0);
    });

    shrike.register('square', function(x) {
      return parseFloat(x) * parseFloat(x);
    });

    shrike.register('round', function(num, dec) {
      dec = dec || 0.0;
      // works to 20 decimal points

      return shrike.scalarIterator(num, function(a) {
        return parseFloat(new Number(a + '').toFixed(parseInt(dec)));
      });
    });
  }
});
