shrike.quat = {};

//
// ##Function: shrike.quat.fromAxisAngle
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
shrike.quat.fromAxisAngle = function(_axis, _angle) {
  var aa = shrike.axisAngle.$(_axis, _angle);
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
// ##Function: shrike.quat.fromMatrix
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
shrike.quat.fromMatrix = function(Traw) {

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
// ##Function: shrike.quat.fromZXY
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
shrike.quat.fromZXY = function(zxy) {
  return shrike.quat.fromMatrix(shrike.matrixFromZXY(shrike.toFloat(zxy)));
};

//
// ##Function: shrike.quat.fromZYX
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
shrike.quat.fromZYX = function(zyx) {
  return shrike.quat.fromMatrix(shrike.matrixFromZYX(shrike.toFloat(zyx)));
};
