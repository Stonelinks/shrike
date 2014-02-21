// common matrix operations
define([

  'underscore'

], function(_) {
  'use strict';

  return function(shrike) {

    shrike.register('add', function(A, B) {
      return shrike.elementWiseIterator(shrike.toFloat(A), shrike.toFloat(B), function(a, b) {
        return a + b;
      });
    });

    shrike.register('subtract', function(A, B) {
      return shrike.elementWiseIterator(shrike.toFloat(A), shrike.toFloat(B), function(a, b) {
        return a - b;
      });
    });

    shrike.register('eltMult', function(A, B) {
      return shrike.elementWiseIterator(shrike.toFloat(A), shrike.toFloat(B), function(a, b) {
        return a * b;
      });
    });

    shrike.register('scalarDivide', function(A, scalar) {
      return shrike.scalarIterator(shrike.toFloat(A), function(a) {
        return a / parseFloat(scalar);
      });
    });

    // alias
    shrike.register('divide', shrike.scalarDivide);

    shrike.register('transpose', function(A) {
      shrike.assert(shrike.is2DArray(A), 'transpose: can only transpose 2d arrays');
      return _.zip.apply(_, A);
    });

    // identity matrix
    // returns an m x n identity matrix
    // if you leave out n, it will be an m x m matrix
    shrike.register('eye', function(m, n) {
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
    });

    // zero matrix
    // returns an m x n matrix of zeros
    // if you leave out n, it will be an m x m matrix
    shrike.register('zeros', function(m, n) {
      n = n || m;
      var ret = [];
      for (var i = 0; i < n; i++) {
        var row = [];
        for (var j = 0; j < m; j++) {
          row.push(0.0);
        }
        ret.push(row);
      }
      return ret;
    });

    shrike.register('magnitude', function(a) {
      if (shrike.isNativeFloatArray(a)) {
        shrike.assert(a.length === 3, 'magnitude: native float array\'s need to be of length three');
        return shrike.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
      }
      return shrike.sqrt(shrike.sum(shrike.toFloat(a).map(square)));
    });

    shrike.register('norm', shrike.magnitude);

    shrike.register('normalize', function(array) {
      var length = shrike.magnitude(array);
      shrike.assert(length !== 0, 'normalize: trying to normalize a zero array');
      return shrike.divide(array, length);
    });

    shrike.register('translate', function(rowVector) {
      var matrix = shrike.eye(4);
      matrix[0][3] = rowVector[0];
      matrix[1][3] = rowVector[1];
      matrix[2][3] = rowVector[2];
      return matrix;
    });

    shrike.register('matrixMult', function(_A, _B) {
      var A = shrike.toFloat(_A);
      var B = shrike.toFloat(_B);

      shrike.assert(A[0].length === A.length, 'matrixMult: incompatible array sizes!');

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
    });

    shrike.register('matrixMultWithRow', function(_M, _v) {
      var M = shrike.toFloat(_M);
      var v = shrike.toFloat(_v);
      var result = new Array(M.length);

      for (var i = 0; i < M.length; ++i) {
        result[i] = 0.0;
        for (var j = 0; j < v.length; ++j) {
          result[i] += M[i][j] * v[j];
        }
      }

      return result;
    });
  }
});
