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
// ##Function: shrike.quat.fromM4
//
// Convert a quaternion from an M4.
//
// **Parameters:**
//
//   - **_m** - the M4 being converted.
//
// **Returns:**
//
// float the converted quaternion.
//
shrike.quat.fromM4 = function(_m) {

  var m = shrike.toFloat(_m);

  var m11 = m[0];
  var m21 = m[1];
  var m31 = m[2];
  var m12 = m[4];
  var m22 = m[5];
  var m32 = m[6];
  var m13 = m[8];
  var m23 = m[9];
  var m33 = m[10];

  var tr = m11 + m22 + m33;
  var r = new FLOAT_ARRAY_TYPE([0.0, 0.0, 0.0, 0.0]);
  if (tr >= 0.0) {
    r[0] = tr + 1.0;
    r[1] = (m32 - m23);
    r[2] = (m13 - m31);
    r[3] = (m21 - m12);
  }
  else {

    // find the largest diagonal element and jump to the appropriate case
    if (m22 > m11) {
      if (m33 > m22) {
        r[3] = (m33 - (m11 + m22)) + 1.0;
        r[1] = (m31 + m13);
        r[2] = (m23 + m32);
        r[0] = (m21 - m12);
      }
      else {
        r[2] = (m22 - (m33 + m11)) + 1.0;
        r[3] = (m23 + m32);
        r[1] = (m12 + m21);
        r[0] = (m13 - m31);
      }
    }
    else if (m33 > m11) {
      r[3] = (m33 - (m11 + m22)) + 1.0;
      r[1] = (m31 + m13);
      r[2] = (m23 + m32);
      r[0] = (m21 - m12);
    }
    else {
      r[1] = (m11 - (m22 + m33)) + 1.0;
      r[2] = (m12 + m21);
      r[3] = (m31 + m13);
      r[0] = (m32 - m23);
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

//
// ##Function: shrike.quat.rotateDirection
//
// Return the minimal quaternion that orients source to target
//
shrike.quat.rotateDirection = function(source, target) {
  var rottodirection = shrike.V3.cross(source, target);
  var fsin = shrike.norm(rottodirection);
  var fcos = shrike.V3.dot(source, target);
  var torient;
  if (fsin > 0.0) {
    return shrike.quat.fromAxisAngle(shrike.V3.scale(rottodirection, (1.0 / fsin)), shrike.atan2(fsin, fcos));
  }
  if (fcos < 0.0) {
    rottodirection = shrike.V3.sub([1.0, 0.0, 0.0], shrike.V3.scale(source, shrike.V3.dot(source, [1.0, 0.0, 0.0])));
    if (shrike.square(shrike.norm(rottodirection)) < 1e-8) {
      rottodirection = shrike.V3.sub([0.0, 0.0, 1.0], shrike.V3.scale(source, shrike.V3.dot(source, [0.0, 0.0, 1.0])));
    }
    shrike.normalize(rottodirection);
    return shrike.quat.fromAxisAngle(rottodirection, shrike.atan2(fsin, fcos));
  }
  return [1.0, 0.0, 0.0, 0.0];
};
