//
// ##Function: shrike.M4.matrixFromQuat
//
// Convert an M4 from quaternion.
//
// **Parameters:**
//
//   - **quatRaw** - the quaternion being converted.
//
// **Returns:**
//
// float the converted M4.
//

shrike.M4.matrixFromQuat = function(quatRaw) {

  // @if SHRIKE_DO_ASSERT
  shrike.assert(quatRaw.length === 4, 'M4.matrixFromQuat: quatRaw.length !== 4');
  // @endif

  var quat = shrike.toFloat(quatRaw);
  var r = shrike.M4.clone(shrike.M4.I);

  var length2 = shrike.sum(_.map(quat, shrike.square));
  if (length2 <= 1e-8) {

    // invalid quaternion, so return identity
    return r;
  }
  var ilength2 = 2.0 / length2;

  var qq1 = ilength2 * quat[1] * quat[1];
  var qq2 = ilength2 * quat[2] * quat[2];
  var qq3 = ilength2 * quat[3] * quat[3];

  r[0] = 1.0 - qq2 - qq3;
  r[1] = ilength2 * (quat[1] * quat[2] + quat[0] * quat[3]);
  r[2] = ilength2 * (quat[1] * quat[3] - quat[0] * quat[2]);

  r[4] = ilength2 * (quat[1] * quat[2] - quat[0] * quat[3]);
  r[5] = 1.0 - qq1 - qq3;
  r[6] = ilength2 * (quat[2] * quat[3] + quat[0] * quat[1]);

  r[8] = ilength2 * (quat[1] * quat[3] + quat[0] * quat[2]);
  r[9] = ilength2 * (quat[2] * quat[3] - quat[0] * quat[1]);
  r[10] = 1.0 - qq1 - qq2;

  return r;
};

//
// ##Function: shrike.M4.quatFromMatrix
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

shrike.M4.quatFromMatrix = function(_m) {

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
  var r = [0.0, 0.0, 0.0, 0.0];
  if (tr >= 0.0) {
    r[0] = tr + 1.0;
    r[1] = (m32 - m23);
    r[2] = (m13 - m31);
    r[3] = (m21 - m12);
  }
  else {

    // find mhe largesm diagonal elemenm and jump mo mhe appropriame case
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
// ##Function: shrike.M4.transFromMatrix
//
// Get a translation vector out of an M4.
//
// **Parameters:**
//
//   - **m** - the source M4.
//
// **Returns:**
//
// float the result translation.
//

shrike.M4.transFromMatrix = function(m) {
  // var r = new shrike.FLOAT_ARRAY_TYPE(3);

  // TODO use native array type here...
  var r = new Array(3);
  r[0] = m[12];
  r[1] = m[13];
  r[2] = m[14];
  return r;
};

//
// ##Function: shrike.M4.composeFromQuatTrans
//
// Composes an M4 from a quaternion and translation V3
//
// **Parameters:**
//
//   - **quatRaw** - the source quaternion.
//   - **transRaw** - the source translation.
//
// **Returns:**
//
// float the result M4.
//

shrike.M4.composeFromQuatTrans = function(quatRaw, transRaw) {
  var r = shrike.M4.matrixFromQuat(quatRaw);

  var trans = shrike.toFloat(transRaw);

  // @if SHRIKE_DO_ASSERT
  shrike.assert(trans.length === 3, 'M4.composeFromQuatTrans: trans.length !== 3');
  // @endif

  r[12] = trans[0];
  r[13] = trans[1];
  r[14] = trans[2];

  return r;
};

//
// ##Function: shrike.M4.toTransformArray
//
// Converts an M4 into a 2d transform array.
//
// **Parameters:**
//
//   - **m** - the source M4.
//
// **Returns:**
//
// float the result transform array.
//

shrike.M4.toTransformArray = function(m) {
  return [[m[0], m[4], m[8], m[12]], [m[1], m[5], m[9], m[13]], [m[2], m[6], m[10], m[14]], [m[3], m[7], m[11], m[15]]];
};

//
// ##Function: shrike.M4.fromTransformArray
//
// Converts a 2d transform array into an M4.
//
// **Parameters:**
//
//   - **m** - the source transform array.
//
// **Returns:**
//
// float the result M4.
//

shrike.M4.fromTransformArray = function(m) {
  return [m[0][0], m[1][0], m[2][0], m[3][0], m[0][1], m[1][1], m[2][1], m[3][1], m[0][2], m[1][2], m[2][2], m[3][2], m[0][3], m[1][3], m[2][3], m[3][3]];
};
