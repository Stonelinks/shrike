//
// ##Function: shrike.M4.fromQuat
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
shrike.M4.fromQuat = function(quatRaw) {

  // @if SHRIKE_DO_ASSERT
  shrike.assert(quatRaw.length === 4, 'M4.fromQuat: quatRaw.length !== 4');
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
  var r = new FLOAT_ARRAY_TYPE(3);
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
  var r = shrike.M4.fromQuat(quatRaw);

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
  return [
    new FLOAT_ARRAY_TYPE([m[0], m[4], m[8], m[12]]),
    new FLOAT_ARRAY_TYPE([m[1], m[5], m[9], m[13]]),
    new FLOAT_ARRAY_TYPE([m[2], m[6], m[10], m[14]]),
    new FLOAT_ARRAY_TYPE([m[3], m[7], m[11], m[15]])
    ];
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
  return new FLOAT_ARRAY_TYPE([m[0][0], m[1][0], m[2][0], m[3][0], m[0][1], m[1][1], m[2][1], m[3][1], m[0][2], m[1][2], m[2][2], m[3][2], m[0][3], m[1][3], m[2][3], m[3][3]]);
};

//
// ##Function: shrike.M4.inverse
//
// Computes the inverse of an M4.
//
// **Parameters:**
//
//   - **m** - the source.
//   - **r** - the optional place to store the result.
//
// **Returns:**
//
// float the result M4.
//
shrike.M4.inverse = function(m, r) {
  if (r == undefined) {
    r = new FLOAT_ARRAY_TYPE(16);
  }

  // cache the matrix values (makes for huge speed increases!)
  var a00 = m[0],
    a10 = m[1],
    a20 = m[2],
    a30 = m[3];
  var a01 = m[4],
    a11 = m[5],
    a21 = m[6],
    a31 = m[7];
  var a02 = m[8],
    a12 = m[9],
    a22 = m[10],
    a32 = m[11];
  var a03 = m[12],
    a13 = m[13],
    a23 = m[14],
    a33 = m[15];

  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;

  // calculate the determinant (inlined to avoid double-caching)
  var invDet = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);

  r[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
  r[4] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
  r[8] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
  r[12] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
  r[1] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
  r[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
  r[9] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
  r[13] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
  r[2] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
  r[6] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
  r[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
  r[14] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
  r[3] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
  r[7] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
  r[11] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
  r[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;

  return r;
};
