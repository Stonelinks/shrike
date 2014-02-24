// functions to augment mjs's V3 vector
define([

  'underscore',
  'mjs'

], function(_, mjs) {
  'use strict';

  return function(shrike) {

    shrike.register('V3.objectToArray', function(_v) {
      var v = shrike.toFloat(_v);
      return ['x', 'y', 'z'].map(function(c) {
        return v[c];
      });
    });

    shrike.register('V3.arrayToObject', function(_v) {
      var v = shrike.toFloat(_v);
      return _.object(['x', 'y', 'z'], v);
    });
  };
});
