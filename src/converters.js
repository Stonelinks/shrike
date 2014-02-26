//
// ##Function: shrike.toFloat
//
// Converts the argument to a float value.
//
// **Parameters:**
//
//   - **x, y, z** - the 3 elements of the new vector.
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
        return _.map(row, _convert);
      });
    }
    else {
      return _.map(thing, _convert);
    }
  }
  else {
    shrike.throwError('toFloat: can not convert to float: ' + thing);
  }
};

/* return a scale so that X source * scale = Y target */
/* this function mirrors GetUnitConversionScale in mujin/dev/mujin/__init__.py */

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

  shrike.assert(_.contains(units, targetUnit) && _.contains(units, sourceUnit), 'no conversion for either ' + sourceUnit + ' or ' + targetUnit);

  return parseFloat(unitDict[targetUnit] / unitDict[sourceUnit]);
};


shrike.toDegrees = function(x) {
  var _convert = function(n) {
    shrike.assert(shrike.isNumber(n), 'toDegrees: not a number');
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


shrike.toRadians = function(x) {
  var _convert = function(n) {
    shrike.assert(shrike.isNumber(n), 'toRadians: not a number');
    return (shrike.PI / 180.0) * n;
  };

  if (shrike.isNumber(x)) {
    return _convert(x);
  }
  else {
    return shrike.scalarIterator(x, _convert);
  }
};

// parses an axis and an angle from some arguments
// input can be an object with axis and angle properties
// or an array of 3 values for the axis and an angle as the second argument
// or an array of 4 values, first three being axis and the last one angle

shrike.parseAxisAngle = function(axis, angle) {
  var _axis;
  var _angle;
  var _throwError = function() {
    shrike.throwError('parseAxisAngle: arguments were not something we recognized');
  };

  if (shrike.isArray(axis)) {
    if (axis.length == 4 && angle === undefined) {
      _axis = axis.slice(0, 3);
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
    angle: shrike.toFloat(_angle)
  };
};

// convert a quaternion from axis angle (radians)

shrike.quatFromAxisAngle = function(_axis, _angle) {
  var aa = shrike.parseAxisAngle(_axis, _angle);
  var axis = aa.axis;
  var angle = aa.angle;

  var axisLength = shrike.sum(_.map(axis, shrike.square));
  if (axisLength <= 1e-10) {
    return [1.0, 0.0, 0.0, 0.0];
  }
  var halfangle = angle / 2.0;
  var sinangle = Math.sin(halfangle) / Math.sqrt(axisLength);

  // TODO: return a float array
  return [Math.cos(halfangle), axis[0] * sinangle, axis[1] * sinangle, axis[2] * sinangle];
};

shrike.quatFromMatrix = function(Traw) {

  var T = shrike.toFloat(Traw);

  var tr = T[0][0] + T[1][1] + T[2][2];
  var rot = [0.0, 0.0, 0.0, 0.0];
  if (tr >= 0.0) {
    rot[0] = tr + 1.0;
    rot[1] = (T[2][1] - T[1][2]);
    rot[2] = (T[0][2] - T[2][0]);
    rot[3] = (T[1][0] - T[0][1]);
  }
  else {

    // find the largest diagonal element and jump to the appropriate case
    if (T[1][1] > T[0][0]) {
      if (T[2][2] > T[1][1]) {
        rot[3] = (T[2][2] - (T[0][0] + T[1][1])) + 1.0;
        rot[1] = (T[2][0] + T[0][2]);
        rot[2] = (T[1][2] + T[2][1]);
        rot[0] = (T[1][0] - T[0][1]);
      }
      else {
        rot[2] = (T[1][1] - (T[2][2] + T[0][0])) + 1.0;
        rot[3] = (T[1][2] + T[2][1]);
        rot[1] = (T[0][1] + T[1][0]);
        rot[0] = (T[0][2] - T[2][0]);
      }
    }
    else if (T[2][2] > T[0][0]) {
      rot[3] = (T[2][2] - (T[0][0] + T[1][1])) + 1.0;
      rot[1] = (T[2][0] + T[0][2]);
      rot[2] = (T[1][2] + T[2][1]);
      rot[0] = (T[1][0] - T[0][1]);
    }
    else {
      rot[1] = (T[0][0] - (T[1][1] + T[2][2])) + 1.0;
      rot[2] = (T[0][1] + T[1][0]);
      rot[3] = (T[2][0] + T[0][2]);
      rot[0] = (T[2][1] - T[1][2]);
    }
  }

  return shrike.divide(rot, shrike.magnitude(rot));
};


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

// angle is returned in radians

shrike.axisAngleFromQuat = function(quatraw) {

  var quat = shrike.toFloat(quatraw);
  var sinang = shrike.sum(_.map(quat.slice(1, 4), shrike.square));

  var identity = {
    axis: [1.0, 0.0, 0.0],
    angle: 0.0
  };
  if (sinang === 0.0) {
    return identity;
  }
  else if (quat[0] * quat[0] + sinang <= 1e-8) {
    throw new Error('invalid quaternion ' + quat);
  }
  var _quat;
  if (quat[0] < 0.0) {
    _quat = [-quat[0], -quat[1], -quat[2], -quat[3]];
  }
  else {
    _quat = quat;
  }
  sinang = Math.sqrt(sinang);
  var f = 1.0 / sinang;

  var angle = 2.0 * Math.atan2(sinang, _quat[0]);
  return {
    axis: [_quat[1] * f, _quat[2] * f, _quat[3] * f],
    angle: angle
  };
};


shrike.axisAngleFromMatrix = function(m) {
  return shrike.axisAngleFromQuat(shrike.quatFromMatrix(m));
};

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


shrike.matrixFromZXY = function(ZXY) {

  var x = shrike.toRadians(parseFloat(ZXY[0]));
  var y = shrike.toRadians(parseFloat(ZXY[1]));
  var z = shrike.toRadians(parseFloat(ZXY[2]));
  return [
  [
    -Math.sin(x) * Math.sin(y) * Math.sin(z) + Math.cos(y) * Math.cos(z),
    -Math.sin(z) * Math.cos(x),
    Math.sin(x) * Math.sin(z) * Math.cos(y) + Math.sin(y) * Math.cos(z)
  ], [
    Math.sin(x) * Math.sin(y) * Math.cos(z) + Math.sin(z) * Math.cos(y),
    Math.cos(x) * Math.cos(z),
    -Math.sin(x) * Math.cos(y) * Math.cos(z) + Math.sin(y) * Math.sin(z)
  ], [
    -Math.sin(y) * Math.cos(x),
    Math.sin(x),
    Math.cos(x) * Math.cos(y)
  ]
    ];
};


shrike.matrixFromZYX = function(ZYX) {
  var x = shrike.toRadians(parseFloat(ZYX[0]));
  var y = shrike.toRadians(parseFloat(ZYX[1]));
  var z = shrike.toRadians(parseFloat(ZYX[2]));
  return [
  [
    Math.cos(y) * Math.cos(z),
    -Math.cos(x) * Math.sin(z) + Math.cos(z) * Math.sin(x) * Math.sin(y),
    Math.sin(x) * Math.sin(z) + Math.cos(x) * Math.cos(z) * Math.sin(y)
  ], [
    Math.cos(y) * Math.sin(z),
    Math.cos(x) * Math.cos(z) + Math.sin(x) * Math.sin(y) * Math.sin(z),
    -Math.cos(z) * Math.sin(x) + Math.cos(x) * Math.sin(y) * Math.sin(z)
  ], [
    -Math.sin(y),
    Math.cos(y) * Math.sin(x),
    Math.cos(x) * Math.cos(y)
  ]
    ];
};


shrike.zxyFromQuat = function(quat) {
  return shrike.zxyFromMatrix(shrike.matrixFromQuat(shrike.toFloat(quat)));
};


shrike.quatFromZXY = function(zxy) {
  return shrike.quatFromMatrix(shrike.matrixFromZXY(shrike.toFloat(zxy)));
};


shrike.zyxFromQuat = function(quat) {
  return shrike.zyxFromMatrix(shrike.matrixFromQuat(shrike.toFloat(quat)));
};


shrike.quatFromZYX = function(zyx) {
  return shrike.quatFromMatrix(shrike.matrixFromZYX(shrike.toFloat(zyx)));
};

// carves out the 3x3 rotation matrix out of a 3x4 or 4x4 transform

shrike.matrix4to3 = function(M) {
  return [[M[0][0], M[0][1], M[0][2]], [M[1][0], M[1][1], M[1][2]], [M[2][0], M[2][1], M[2][2]]];
};


shrike.composeTransformArray = function(rot, trans) {
  return [[rot[0][0], rot[0][1], rot[0][2], trans[0]], [rot[1][0], rot[1][1], rot[1][2], trans[1]], [rot[2][0], rot[2][1], rot[2][2], trans[2]], [0.0, 0.0, 0.0, 1.0]];
};


shrike.decomposeTransformArray = function(T) {
  return {
    rotationMatrix: [T[0].slice(0, 3), T[1].slice(0, 3), T[2].slice(0, 3)],
    translation: [T[0][3], T[1][3], T[2][3]]
  };
};

// TODO move into M4 namespace as toTransformArray and fromTransformArray

shrike.M4toTransformArray = function(m) {
  return [[m[0], m[4], m[8], m[12]], [m[1], m[5], m[9], m[13]], [m[2], m[6], m[10], m[14]], [m[3], m[7], m[11], m[15]]];
};


shrike.transformArrayToM4 = function(m) {
  return [m[0][0], m[1][0], m[2][0], m[3][0], m[0][1], m[1][1], m[2][1], m[3][1], m[0][2], m[1][2], m[2][2], m[3][2], m[0][3], m[1][3], m[2][3], m[3][3]];
};
