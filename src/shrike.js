/* @echo BANNER */
define(['underscore', 'mjs'], function(_, mjs) {
  'use strict';

  var shrike = {};

  // @include base.js
  // @include detectors.js
  // @include converters.js
  // @include iterators.js
  // @include common.js
  // @include matrix.js
  // @include quaternion.js
  // @include axisAngle.js
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
