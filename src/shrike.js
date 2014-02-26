define(['underscore', 'mjs'], function(_, mjs) {
  'use strict';

  var shrike = {};

  // @include utils.js
  // @include iterators.js
  // @include base.js
  // @include common.js
  // @include converters.js
  // @include matrix.js
  // @include V3.js
  // @include M4.js
  // @include tween.js

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
