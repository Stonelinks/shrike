define([

  'underscore'

], function(_) {
  'use strict';

  return function(shrike) {

    shrike.isArray = function(A) {
      return _.isArray(A) ? true : Object.prototype.toString.call(A).slice(-'Array]'.length) == 'Array]';
    };
  }
});
