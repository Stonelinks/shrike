define([

  'underscore'

], function(_) {
  'use strict';

  var print = window.print || function(s) {
      console.log(s);
    };

  return function(shrike) {

    // set a property on the shrike object, warn if it conflicts
    shrike.register = function(k, v) {
      if (shrike.hasOwnProperty(k)) {
        print('SHRIKE: error: shrike already has a ' + k);
      }
      else {
        shrike[k] = v;
      }
    };

    shrike.register('isArray', function(A) {
      return _.isArray(A) ? true : Object.prototype.toString.call(A).slice(-'Array]'.length) == 'Array]';
    });
  }
});
