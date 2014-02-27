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
  else if (shrike.isFloatArray(thing)) {
    return thing;
  }

  // its an array
  else if (shrike.isArray(thing)) {

    var _convert = function(thing) {

      shrike.assert(shrike.isNumber(thing), 'toFloat: array has something in it that is not a number: ' + thing);
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
// ##Function: shrike.toNormalArray
//
// Converts the argument to a normal array.
//
// **Parameters:**
//
//   - **thing** - thing you're trying to convert.
//
// **Returns:**
//
// A new plain converted array.
//
shrike.toNormalArray = function(a) {

  shrike.assert(shrike.isArray(a), 'toNormalArray: needs to be a float array or array like object: ' + a);

  if (shrike.isFloatArray(a)) {
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
// ##Function: shrike.toRadians
//
// parses an axis and an angle into an object from some arguments
//
// **Parameters:**
//
//   - Can be an object with axis and angle properties
//   - or an array of 3 values for the axis and an angle as the second argument
//   - or an array of 4 values, first three being axis and the last one angle
//
// **Returns:**
//
// an object that looks like this:
//
//     {
//       axis: [float x, float y, float z],
//       angle: float
//     }
//
shrike.parseAxisAngle = function(axis, angle) {
  var _axis;
  var _angle;
  var _throwError = function() {
    shrike.throwError('parseAxisAngle: arguments were not something we recognized');
  };

  if (shrike.isArray(axis)) {
    if (axis.length == 4 && angle === undefined) {
      _axis = [axis[0], axis[1], axis[2]];
      _angle = axis[3];
    }
    else if (axis.length == 3 && angle !== undefined) {
      _axis = axis;
      _angle = angle;
    }
    else {
      _throwError();
    }
  }
  else if (_.isObject(axis) && angle === undefined) {
    if (axis.hasOwnProperty('axis') && axis.hasOwnProperty('angle')) {
      _axis = axis.axis;
      _angle = axis.angle;
    }
    else {
      _throwError();
    }
  }
  else {
    _throwError();
  }
  return {
    axis: shrike.toFloat(_axis),
    angle: parseFloat(_angle)
  };
};

//
// ##Function: shrike.quatFromAxisAngle
//
// Convert a quaternion from axis angle (radians).
//
// **Parameters:**
//
//   - Can be an object with axis and angle properties
//   - or an array of 3 values for the axis and an angle as the second argument
//   - or an array of 4 values, first three being axis and the last one angle
//
// **Returns:**
//
// float the converted quaternion.
//
shrike.quatFromAxisAngle = function(_axis, _angle) {
  var aa = shrike.parseAxisAngle(_axis, _angle);
  var axis = aa.axis;
  var angle = aa.angle;

  var axisLength = shrike.sum(_.map(axis, shrike.square));
  if (axisLength <= 1e-10) {
    return new FLOAT_ARRAY_TYPE([1.0, 0.0, 0.0, 0.0]);
  }
  var halfangle = angle / 2.0;
  var sinangle = Math.sin(halfangle) / Math.sqrt(axisLength);

  // TODO: return a float array
  return new FLOAT_ARRAY_TYPE([Math.cos(halfangle), axis[0] * sinangle, axis[1] * sinangle, axis[2] * sinangle]);
};

//
// ##Function: shrike.quatFromMatrix
//
// Convert a quaternion from matrix.
//
// **Parameters:**
//
//   - **Traw** - the matrix being converted.
//
// **Returns:**
//
// float the converted quaternion.
//
shrike.quatFromMatrix = function(Traw) {

  var T = shrike.toFloat(Traw);

  var tr = T[0][0] + T[1][1] + T[2][2];
  var r = new FLOAT_ARRAY_TYPE([0.0, 0.0, 0.0, 0.0]);
  if (tr >= 0.0) {
    r[0] = tr + 1.0;
    r[1] = (T[2][1] - T[1][2]);
    r[2] = (T[0][2] - T[2][0]);
    r[3] = (T[1][0] - T[0][1]);
  }
  else {

    // find the largest diagonal element and jump to the appropriate case
    if (T[1][1] > T[0][0]) {
      if (T[2][2] > T[1][1]) {
        r[3] = (T[2][2] - (T[0][0] + T[1][1])) + 1.0;
        r[1] = (T[2][0] + T[0][2]);
        r[2] = (T[1][2] + T[2][1]);
        r[0] = (T[1][0] - T[0][1]);
      }
      else {
        r[2] = (T[1][1] - (T[2][2] + T[0][0])) + 1.0;
        r[3] = (T[1][2] + T[2][1]);
        r[1] = (T[0][1] + T[1][0]);
        r[0] = (T[0][2] - T[2][0]);
      }
    }
    else if (T[2][2] > T[0][0]) {
      r[3] = (T[2][2] - (T[0][0] + T[1][1])) + 1.0;
      r[1] = (T[2][0] + T[0][2]);
      r[2] = (T[1][2] + T[2][1]);
      r[0] = (T[1][0] - T[0][1]);
    }
    else {
      r[1] = (T[0][0] - (T[1][1] + T[2][2])) + 1.0;
      r[2] = (T[0][1] + T[1][0]);
      r[3] = (T[2][0] + T[0][2]);
      r[0] = (T[2][1] - T[1][2]);
    }
  }

  return shrike.divide(r, shrike.magnitude(r));
};

//
// ##Function: shrike.matrixFromQuat
//
// Convert a matrix from quaternion.
//
// **Parameters:**
//
//   - **quatRaw** - the quaternion being converted.
//
// **Returns:**
//
// float the converted matrix.
//
shrike.matrixFromQuat = function(quatRaw) {
  var quat = shrike.toFloat(quatRaw);

  var length2 = shrike.square(shrike.magnitude(quat));
  if (length2 <= 1e-8) {

    // invalid quaternion, so return identity
    return m.eye(4);
  }
  var ilength2 = 2.0 / length2;

  var qq1 = ilength2 * quat[1] * quat[1];
  var qq2 = ilength2 * quat[2] * quat[2];
  var qq3 = ilength2 * quat[3] * quat[3];

  var T = shrike.eye(4);

  T[0][0] = 1.0 - qq2 - qq3;
  T[0][1] = ilength2 * (quat[1] * quat[2] - quat[0] * quat[3]);
  T[0][2] = ilength2 * (quat[1] * quat[3] + quat[0] * quat[2]);
  T[1][0] = ilength2 * (quat[1] * quat[2] + quat[0] * quat[3]);
  T[1][1] = 1.0 - qq1 - qq3;
  T[1][2] = ilength2 * (quat[2] * quat[3] - quat[0] * quat[1]);
  T[2][0] = ilength2 * (quat[1] * quat[3] - quat[0] * quat[2]);
  T[2][1] = ilength2 * (quat[2] * quat[3] + quat[0] * quat[1]);
  T[2][2] = 1.0 - qq1 - qq2;

  return T;
};

//
// ##Function: shrike.axisAngleFromQuat
//
// Convert a quaternion into axis angle representation.
//
// **Parameters:**
//
//   - **quatRaw** - the quaternion being converted.
//
// **Returns:**
//
// float the converted axis angle object (angle is in radians).
//
shrike.axisAngleFromQuat = function(quatraw) {

  var quat = shrike.toFloat(quatraw);
  var sinang = shrike.sum(_.map([quat[1], quat[2], quat[3]], shrike.square));

  var identity = {
    axis: new FLOAT_ARRAY_TYPE([1.0, 0.0, 0.0]),
    angle: 0.0
  };
  if (sinang === 0.0) {
    return identity;
  }
  else if (quat[0] * quat[0] + sinang <= 1e-8) {
    shrike.throwError('invalid quaternion ' + quat);
  }
  var _quat;
  if (quat[0] < 0.0) {
    _quat = new FLOAT_ARRAY_TYPE([-quat[0], -quat[1], -quat[2], -quat[3]]);
  }
  else {
    _quat = quat;
  }
  sinang = Math.sqrt(sinang);
  var f = 1.0 / sinang;

  var angle = 2.0 * Math.atan2(sinang, _quat[0]);
  return {
    axis: new FLOAT_ARRAY_TYPE([_quat[1] * f, _quat[2] * f, _quat[3] * f]),
    angle: angle
  };
};

//
// ##Function: shrike.axisAngleFromMatrix
//
// Convert a matrix into axis angle representation.
//
// **Parameters:**
//
//   - **m** - the matrix being converted.
//
// **Returns:**
//
// float the converted axis angle object (angle is in radians).
//
shrike.axisAngleFromMatrix = function(m) {
  return shrike.axisAngleFromQuat(shrike.quatFromMatrix(m));
};

//
// ##Function: shrike.zxyFromMatrix
//
// Convert a matrix into zxy angle representation.
//
// **Parameters:**
//
//   - **Traw** - the matrix being converted.
//
// **Returns:**
//
// float the converted array of angles (angles are is in degrees).
//
shrike.zxyFromMatrix = function(Traw) {

  var T = shrike.matrix4to3(shrike.toFloat(Traw));

  var epsilon = 1e-10;

  var x, y, z;
  if ((Math.abs(T[2][0]) < epsilon) && (Math.abs(T[2][2]) < epsilon)) {
    var sinx = T[2][1];
    if (sinx > 0.0) {
      x = Math.PI / 2.0;
    }
    else {
      x = -Math.PI / 2.0;
    }
    z = 0.0;
    y = Math.atan2(sinx * T[1][0], T[0][0]);
  }
  else {
    y = Math.atan2(-T[2][0], T[2][2]);
    var siny = Math.sin(y);
    var cosy = Math.cos(y);
    var Ryinv = [
    [cosy, 0.0, -siny],
    [0.0, 1.0, 0.0],
    [siny, 0.0, cosy]
  ];
    var Rzx = shrike.matrixMult(T, Ryinv);
    x = Math.atan2(Rzx[2][1], Rzx[2][2]);
    z = Math.atan2(Rzx[1][0], Rzx[0][0]);
  }
  return shrike.toDegrees([x, y, z]);
};

//
// ##Function: shrike.zyxFromMatrix
//
// Convert a matrix into zyx angle representation.
//
// **Parameters:**
//
//   - **Traw** - the matrix being converted.
//
// **Returns:**
//
// float the converted array of angles (angles are is in degrees).
//
shrike.zyxFromMatrix = function(Traw) {
  var T = shrike.toFloat(Traw);
  var epsilon = 1e-10;
  var x, y, z;

  if ((Math.abs(T[2][1]) < epsilon) && (Math.abs(T[2][2]) < epsilon)) {
    if (T[2][0] <= 0.0) {
      y = Math.PI / 2.0;
    }
    else {
      y = -Math.PI / 2.0;
    }
    if (y > 0.0) {
      var xminusz = Math.atan2(T[0][1], T[1][1]);
      x = xminusz;
      z = 0.0;
    }
    else {
      var xplusz = -Math.atan2(T[0][1], T[1][1]);
      x = xplusz;
      z = 0.0;
    }
  }
  else {
    x = Math.atan2(T[2][1], T[2][2]);
    var sinx = Math.sin(x);
    var cosx = Math.cos(x);
    var Rxinv = [[1.0, 0.0, 0.0], [0.0, cosx, sinx], [0.0, -sinx, cosx]];
    var Rzy = shrike.matrixMult(shrike.matrix4to3(T), Rxinv);
    y = Math.atan2(-Rzy[2][0], Rzy[2][2]);
    z = Math.atan2(-Rzy[0][1], Rzy[1][1]);
  }

  return shrike.toDegrees([x, y, z]);
};

//
// ##Function: shrike.matrixFromZXY
//
// Convert a zxy angle array into matrix representation.
//
// **Parameters:**
//
//   - **ZXY** - the zxy angle array being converted.
//
// **Returns:**
//
// float the converted matrix.
//
shrike.matrixFromZXY = function(ZXY) {

  var x = shrike.toRadians(parseFloat(ZXY[0]));
  var y = shrike.toRadians(parseFloat(ZXY[1]));
  var z = shrike.toRadians(parseFloat(ZXY[2]));
  return [
    new FLOAT_ARRAY_TYPE([
    -Math.sin(x) * Math.sin(y) * Math.sin(z) + Math.cos(y) * Math.cos(z),
    -Math.sin(z) * Math.cos(x),
    Math.sin(x) * Math.sin(z) * Math.cos(y) + Math.sin(y) * Math.cos(z)
  ]),
    new FLOAT_ARRAY_TYPE([
    Math.sin(x) * Math.sin(y) * Math.cos(z) + Math.sin(z) * Math.cos(y),
    Math.cos(x) * Math.cos(z),
    -Math.sin(x) * Math.cos(y) * Math.cos(z) + Math.sin(y) * Math.sin(z)
  ]),
    new FLOAT_ARRAY_TYPE([
    -Math.sin(y) * Math.cos(x),
    Math.sin(x),
    Math.cos(x) * Math.cos(y)
  ])
    ];
};

//
// ##Function: shrike.matrixFromZYX
//
// Convert a zyx angle array into matrix representation.
//
// **Parameters:**
//
//   - **Traw** - the matrix being converted.
//
// **Returns:**
//
// float the converted matrix.
//
shrike.matrixFromZYX = function(ZYX) {
  var x = shrike.toRadians(parseFloat(ZYX[0]));
  var y = shrike.toRadians(parseFloat(ZYX[1]));
  var z = shrike.toRadians(parseFloat(ZYX[2]));
  return [
    new FLOAT_ARRAY_TYPE([
    Math.cos(y) * Math.cos(z),
    -Math.cos(x) * Math.sin(z) + Math.cos(z) * Math.sin(x) * Math.sin(y),
    Math.sin(x) * Math.sin(z) + Math.cos(x) * Math.cos(z) * Math.sin(y)
  ]),
    new FLOAT_ARRAY_TYPE([
    Math.cos(y) * Math.sin(z),
    Math.cos(x) * Math.cos(z) + Math.sin(x) * Math.sin(y) * Math.sin(z),
    -Math.cos(z) * Math.sin(x) + Math.cos(x) * Math.sin(y) * Math.sin(z)
  ]),
    new FLOAT_ARRAY_TYPE([
    -Math.sin(y),
    Math.cos(y) * Math.sin(x),
    Math.cos(x) * Math.cos(y)
  ])
    ];
};

//
// ##Function: shrike.zxyFromQuat
//
// Convert a quaternion into zxy representation.
//
// **Parameters:**
//
//   - **quat** - the quaternion being converted.
//
// **Returns:**
//
// float the converted array of angles (angles are is in degrees).
//
shrike.zxyFromQuat = function(quat) {
  return shrike.zxyFromMatrix(shrike.matrixFromQuat(shrike.toFloat(quat)));
};

//
// ##Function: shrike.quatFromZXY
//
// Convert a zxy angle array into quaternion.
//
// **Parameters:**
//
//   - **zxy** - the angle array being converted.
//
// **Returns:**
//
// float the converted quaternion.
//
shrike.quatFromZXY = function(zxy) {
  return shrike.quatFromMatrix(shrike.matrixFromZXY(shrike.toFloat(zxy)));
};

//
// ##Function: shrike.zyxFromQuat
//
// Convert a quaternion into zxy representation.
//
// **Parameters:**
//
//   - **quat** - the quaternion being converted.
//
// **Returns:**
//
// float the converted array of angles (angles are is in degrees).
//
shrike.zyxFromQuat = function(quat) {
  return shrike.zyxFromMatrix(shrike.matrixFromQuat(shrike.toFloat(quat)));
};

//
// ##Function: shrike.quatFromZYX
//
// Convert a zyx angle array into quaternion.
//
// **Parameters:**
//
//   - **zyx** - the angle array being converted.
//
// **Returns:**
//
// float the converted quaternion.
//
shrike.quatFromZYX = function(zyx) {
  return shrike.quatFromMatrix(shrike.matrixFromZYX(shrike.toFloat(zyx)));
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
