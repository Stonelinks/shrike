//
// ##Function: shrike.eye
//
// Makes an identity matrix.
//
// **Parameters:**
//
//   - **m** - number of columns.
//   - **n** - (optional) number of rows. If left unspecified, result will be an m x m matrix
//
// **Returns:**
//
// An m x n identity matrix.
//
shrike.eye = function(m, n) {
  n = n || m;
  var ret = [];
  for (var i = 0; i < n; i++) {
    var row = [];
    for (var j = 0; j < m; j++) {
      if (i == j) {
        row.push(1.0);
      }
      else {
        row.push(0.0);
      }
    }
    ret.push(row);
  }
  return ret;
};

//
// ##Function: shrike.matrixMult
//
// Unfancy 2d matrix multiplication.
//
// **Parameters:**
//
//   - **_A** - first array operand.
//   - **_B** - second array operand.
//
// **Returns:**
//
// float result of A * B
//
shrike.matrixMult = function(_A, _B) {
  var A = shrike.toFloat(_A);
  var B = shrike.toFloat(_B);

  // @if SHRIKE_DO_ASSERT
  shrike.assert(A[0].length === A.length, 'matrixMult: incompatible array sizes!');
  // @endif

  var result = [];
  for (var i = 0; i < A.length; i++) {
    var row = [];
    for (var j = 0; j < B[i].length; j++) {
      var sum = 0;
      for (var k = 0; k < A[i].length; k++) {
        sum += A[i][k] * B[k][j];
      }
      row.push(sum);
    }
    result.push(row);
  }

  return result;
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
