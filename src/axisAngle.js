shrike.axisAngle = {};

//
// ##Function: shrike.axisAngle.$
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
shrike.axisAngle.$ = function(axis, angle) {
  var _axis;
  var _angle;
  var _throwError = function() {
    shrike.throwError('axisAngle.$: arguments were not something we recognized');
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
// ##Function: shrike.axisAngle.fromQuat
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
shrike.axisAngle.fromQuat = function(quatraw) {

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
// ##Function: shrike.axisAngle.fromMatrix
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
shrike.axisAngle.fromMatrix = function(m) {
  return shrike.axisAngle.fromQuat(shrike.quat.fromMatrix(m));
};
