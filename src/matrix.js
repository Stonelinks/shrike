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

    shrike.register('scalarMult', function(A, scalar) {
      return shrike.scalarIterator(shrike.toFloat(A), function(a) {
        return a * parseFloat(scalar);
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

    shrike.register('dot', function(A, B) {
      return shrike.sum(shrike.eltMult(shrike.toFloat(A), shrike.toFloat(B)));
    });

    shrike.register('cross', function(_A, _B) {
      if (!shrike.isArray(_A) || !shrike.isArray(_B) || _A.length != 3 || _B.length != 3) {
        shrike.throwError('cross: can\'t do a cross product with ' + _A + ' and ' + _B);
      }

      var A = shrike.toFloat(_A);
      var B = shrike.toFloat(_B);

      // a x b = (a2b3 - a3b2)i + (a3b1 - a1b3)j + (a1b2 - a2b1)k
      return [(A[1] * B[2]) - (A[2] * B[1]), (A[2] * B[0]) - (A[0] * B[2]), (A[0] * B[1]) - (A[1] * B[0])];
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

    shrike.register('identity', shrike.eye);

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
      return Math.sqrt(shrike.sum(shrike.toFloat(a).map(square)));
    });

    shrike.register('norm', shrike.magnitude);

    // TODO: rewrite the app so you can get rid of this
    shrike.register('normalizeColVector', function(array) {
      return shrike.transpose([shrike.normalize(shrike.transpose(array)[0])]);
    });

    shrike.register('normalize', function(array) {

      // TODO: this try..catch is bad and you should feel bad
      try {
        var length = shrike.magnitude(array);
        shrike.assert(length !== 0, 'normalize: trying to normalize a zero array');
        return shrike.divide(array, length);
      }
      catch (e) {
        return shrike.normalizeColVector(array);
      }
    });

    shrike.register('translate', function(rowVector) {
      var matrix = shrike.eye(4);
      matrix[0][3] = rowVector[0];
      matrix[1][3] = rowVector[1];
      matrix[2][3] = rowVector[2];
      return matrix;
    });

    // returns a camera 4x4 matrix that looks along a ray with a desired up vector.
    shrike.register('transformLookat', function(_lookat, _camerapos, _cameraup) {

      var lookat = shrike.toFloat(_lookat);
      var camerapos = shrike.toFloat(_camerapos);
      var cameraup = shrike.toFloat(_cameraup);

      var cameradir = shrike.subtract(lookat, camerapos);
      var cameradirlen = shrike.norm(cameradir);

      if (cameradirlen > 1e-15) {
        cameradir = shrike.scalarMult(cameradir, 1.0 / cameradirlen);
      }
      else {
        cameradir = [0.0, 0.0, 1.0];
      }

      var up = shrike.subtract(cameraup, shrike.scalarMult(cameradir, shrike.dot(cameradir, cameraup)));

      cameradirlen = shrike.norm(up);
      if (cameradirlen < 1e-8) {
        up = [0.0, 1.0, 0.0];
        up = shrike.subtract(up, shrike.scalarMult(cameradir, shrike.dot(cameradir, up)));
        cameradirlen = shrike.norm(up);
        if (cameradirlen < 1e-8) {
          up = [1.0, 0.0, 0.0];
          up = shrike.subtract(up, shrike.scalarMult(cameradir, shrike.dot(cameradir, up)));
          cameradirlen = shrike.norm(up);
        }
      }

      up = shrike.scalarMult(up, 1.0 / cameradirlen);

      var right = shrike.cross(up, cameradir);
      var t = shrike.eye(4);
      t[0][0] = right[0];
      t[0][1] = up[0];
      t[0][2] = cameradir[0];
      t[0][3] = camerapos[0];
      t[1][0] = right[1];
      t[1][1] = up[1];
      t[1][2] = cameradir[1];
      t[1][3] = camerapos[1];
      t[2][0] = right[2];
      t[2][1] = up[2];
      t[2][2] = cameradir[2];
      t[2][3] = camerapos[2];
      return t;
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
