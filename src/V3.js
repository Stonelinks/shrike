//
// ##Function: shrike.V3.fromObject
//
// Converts an object with xyz attributes into a V3.
//
// **Parameters:**
//
//   - **o** - the source object.
//
// **Returns:**
//
// float the result V3.
//
shrike.V3.fromObject = function(o) {

  // @if SHRIKE_DO_ASSERT
  shrike.assert(_.isObject(o), 'not an object');
  // @endif

  return new FLOAT_ARRAY_TYPE([o.x, o.y, o.z]);
};

//
// ##Function: shrike.V3.toObject
//
// Converts a V3 into an object with xyz attributes.
//
// **Parameters:**
//
//   - **_v** - the source V3.
//
// **Returns:**
//
// float the result object.
//
shrike.V3.toObject = function(_v) {

  // @if SHRIKE_DO_ASSERT
  shrike.assert(shrike.isArray(_v), 'not an array');
  // @endif

  var v = shrike.toFloat(_v);
  return _.object(['x', 'y', 'z'], v);
};
