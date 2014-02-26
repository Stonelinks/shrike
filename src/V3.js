// functions to augment mjs's V3 vector

shrike.V3.objectToArray = function(o) {

  // @if SHRIKE_DO_ASSERT
  shrike.assert(_.isObject(o), 'not an object');
  // @endif

  return ['x', 'y', 'z'].map(function(p) {
    return o[p];
  });
};


shrike.V3.arrayToObject = function(_v) {

  // @if SHRIKE_DO_ASSERT
  shrike.assert(shrike.isArray(_v), 'not an array');
  // @endif

  var v = shrike.toFloat(_v);
  return _.object(['x', 'y', 'z'], v);
};
