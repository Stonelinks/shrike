// common matrix operations
define([

  'underscore'

], function(_) {
  'use strict';

  return function(shrike) {

    shrike.register('divide', function(A, scalar) {
      return shrike.scalarIterator(shrike.toFloat(A), function(a) {
        return a / parseFloat(scalar);
      });
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

    shrike.register('magnitude', function(a) {
      if (shrike.isNativeFloatArray(a)) {
        shrike.assert(a.length === 3, 'magnitude: native float array\'s need to be of length three');
        return shrike.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
      }
      return shrike.sqrt(shrike.sum(_.map(shrike.toFloat(a), shrike.square)));
    });

    shrike.alias('norm', 'magnitude');

    shrike.register('normalize', function(array) {
      var length = shrike.magnitude(array);
      shrike.assert(length !== 0, 'normalize: trying to normalize a zero array');
      return shrike.divide(array, length);
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
  }
});
