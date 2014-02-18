// assign base properites to shrike
define([

  'underscore',
  'mjs'

], function(_, mjs) {
  'use strict';

  return function(shrike) {

    // borrow all of Math's functions and constants... except round since shrike provides its own round function
    _.without(Object.getOwnPropertyNames(Math), 'round').forEach(function(prop) {
      shrike.register(prop, Math[prop]);
    });

    // borrow mjs too
    Object.getOwnPropertyNames(mjs).forEach(function(prop) {
      shrike.register(prop, mjs[prop]);
    });

    // alias M4x4 to M4 since it is shorter to type
    shrike.alias('M4', 'M4x4');
  }
});
