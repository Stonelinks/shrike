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
