//
// ##Function: shrike.toFloat
//
// Converts the argument to a float value.
//
// **Parameters:**
//
//   - **thing** - thing you're trying to convert.
//
// **Returns:**
//
// A new vector containing with the given argument values.
//
shrike.toFloat = function(thing) {

  // its a number
  if (shrike.isNumber(thing)) {
    return parseFloat(thing);
  }

  // its already floating point
  else if (shrike.isTypedArray(thing)) {
    return thing;
  }

  // its an array
  else if (shrike.isArray(thing)) {

    var _convert = function(thing) {

      // @if SHRIKE_DO_ASSERT
      shrike.assert(shrike.isNumber(thing), 'toFloat: array has something in it that is not a number: ' + thing);
      // @endif

      return parseFloat(thing);
    };

    // its a 2d array
    if (shrike.is2DArray(thing)) {
      return _.map(thing, function(row) {
        return new FLOAT_ARRAY_TYPE(_.map(row, _convert));
      });
    }
    else {
      return new FLOAT_ARRAY_TYPE(_.map(thing, _convert));
    }
  }
  else {
    shrike.throwError('toFloat: can not convert to float: ' + thing);
  }
};

//
// ##Function: shrike.toUntypedArray
//
// Converts the argument to an untyped array.
//
// **Parameters:**
//
//   - **thing** - thing you're trying to convert.
//
// **Returns:**
//
// A new plain converted array.
//
shrike.toUntypedArray = function(a) {

  // @if SHRIKE_DO_ASSERT
  shrike.assert(shrike.isArray(a), 'toUntypedArray: needs to be a float array or array like object: ' + a);
  // @endif

  if (shrike.isTypedArray(a)) {
    return Array.apply([], a);
  }
};

//
// ##Function: shrike.unitConversionScale
//
// Return a scale so that X source * scale = Y target.
//
// **Parameters:**
//
//   - **sourceUnit** - the source unit.
//   - **targetUnit** - the target unit.
//
// **Returns:**
//
// float scale.
//
shrike.unitConversionScale = function(sourceUnit, targetUnit) {
  var unitDict = {
    m: 1.0,
    meter: 1.0,
    cm: 100.0,
    mm: 1000.0,
    um: 1e6,
    nm: 1e9,
    inch: 39.370078740157481,
    in : 39.370078740157481
  };
  var units = _.keys(unitDict);

  // @if SHRIKE_DO_ASSERT
  shrike.assert(_.contains(units, targetUnit) && _.contains(units, sourceUnit), 'no conversion for either ' + sourceUnit + ' or ' + targetUnit);
  // @endif

  return parseFloat(unitDict[targetUnit] / unitDict[sourceUnit]);
};

//
// ##Function: shrike.toDegrees
//
// Converts a number, 1 or 2d array of angles in degrees to radians.
//
// **Parameters:**
//
//   - **x** - the item being converted.
//
// **Returns:**
//
// the converted value.
//
shrike.toDegrees = function(x) {
  var _convert = function(n) {

    // @if SHRIKE_DO_ASSERT
    shrike.assert(shrike.isNumber(n), 'toDegrees: not a number');
    // @endif

    if (shrike.abs(n) <= 1e-10) {
      return 0.0;
    }
    else {
      return (180.0 / shrike.PI) * n;
    }
  };

  if (shrike.isNumber(x)) {
    return _convert(x);
  }
  else {
    return shrike.scalarIterator(x, _convert);
  }
};

//
// ##Function: shrike.toRadians
//
// Converts a number, 1 or 2d array of angles in radians to degrees.
//
// **Parameters:**
//
//   - **x** - the item being converted.
//
// **Returns:**
//
// float the converted value.
//
shrike.toRadians = function(x) {
  var _convert = function(n) {

    // @if SHRIKE_DO_ASSERT
    shrike.assert(shrike.isNumber(n), 'toRadians: not a number');
    // @endif

    return (shrike.PI / 180.0) * n;
  };

  if (shrike.isNumber(x)) {
    return _convert(x);
  }
  else {
    return shrike.scalarIterator(x, _convert);
  }
};

//
// ##Function: shrike.matrix4to3
//
// Carves out the 3x3 rotation matrix out of a 3x4 or 4x4 transform.
//
// **Parameters:**
//
//   - **M** - the source matrix.
//
// **Returns:**
//
// float 3x3 rotation matrix.
//
shrike.matrix4to3 = function(M) {
  return [
    new FLOAT_ARRAY_TYPE([M[0][0], M[0][1], M[0][2]]),
    new FLOAT_ARRAY_TYPE([M[1][0], M[1][1], M[1][2]]),
    new FLOAT_ARRAY_TYPE([M[2][0], M[2][1], M[2][2]])
    ];
};

//
// ##Function: shrike.composeTransformArray
//
// Make a 4x4 transform from a 3x3 rotation matrix and a translation vector.
//
// **Parameters:**
//
//   - **rot** - the rotation matrix.
//   - **trans** - the translation vector.
//
// **Returns:**
//
// float the 4x4 result matrix.
//
shrike.composeTransformArray = function(rot, trans) {
  return [
    new FLOAT_ARRAY_TYPE([rot[0][0], rot[0][1], rot[0][2], trans[0]]),
    new FLOAT_ARRAY_TYPE([rot[1][0], rot[1][1], rot[1][2], trans[1]]),
    new FLOAT_ARRAY_TYPE([rot[2][0], rot[2][1], rot[2][2], trans[2]]),
    new FLOAT_ARRAY_TYPE([0.0, 0.0, 0.0, 1.0])
    ];
};

//
// ##Function: shrike.decomposeTransformArray
//
// Break a 4x4 transform down into a 3x3 rotation matrix and a translation vector.
//
// **Parameters:**
//
//   - **T** - the source matrix.
//
// **Returns:**
//
// an object that looks like this
//
//     {
//       rotationMatrix: 3x3 rotation matrix,
//       translation: [float x, float y, float z],
//     }

shrike.decomposeTransformArray = function(T) {
  return {
    rotationMatrix: [
      new FLOAT_ARRAY_TYPE([T[0][0], T[0][1], T[0][2]]),
      new FLOAT_ARRAY_TYPE([T[1][0], T[1][1], T[1][2]]),
      new FLOAT_ARRAY_TYPE([T[2][0], T[2][1], T[2][2]])
    ],
    translation: new FLOAT_ARRAY_TYPE([T[0][3], T[1][3], T[2][3]])
  };
};
