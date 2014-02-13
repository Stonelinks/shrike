define([

  'underscore',
  'mjs',
  './utils'

], function(_, mjs, utils) {
  'use strict';

  var shrike = {};

  utils(shrike);

  // borrow all of Math's functions and constants
  Object.getOwnPropertyNames(Math).forEach(function(prop) {
    shrike.register(prop, Math[prop]);
  });

  return shrike;
});
