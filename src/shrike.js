define([

  'underscore',
  './utils',
  './iterators',
  './base',
  './converters',
  './matrix',
  './tween'

], function(_, utils, iterators, base, converters, matrix, tween) {
  'use strict';

  var shrike = {};

  utils(shrike);
  iterators(shrike);
  base(shrike);
  converters(shrike);
  matrix(shrike);
  tween(shrike);

  // for debugging / console convenience
  if (window.makeGlobal !== undefined) {
    window.makeGlobal(shrike);
    window.makeGlobal({
      math: shrike,
      shrike: shrike
    });
  }

  return shrike;
});
