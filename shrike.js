// shrike - v0.0.6
//
// https://github.com/Stonelinks/shrike
//
// A fast and easy to use vector and matrix library
//
// Copyright (c)2014 - Lucas Doyle <lucas.p.doyle@gmail.com>
//
// Distributed under MIT license
//


define(['underscore', 'mjs'], function(_, mjs) {
  'use strict';

  var shrike = {};

  // Borrow all of window.Math's functions and constants... except round since shrike provides its own round function.
  _.without(Object.getOwnPropertyNames(Math), 'round').forEach(function(prop) {
    shrike[prop] = Math[prop];
  });
  
  // Borrow mjs too.
  Object.getOwnPropertyNames(mjs).forEach(function(prop) {
    shrike[prop] = mjs[prop];
  });
  
  // Alias M4x4 to M4 for convenience.
  shrike.M4 = shrike.M4x4;
  
  //
  // ##Constant: FLOAT_ARRAY_TYPE
  //
  // The base float array type, borrowed it from mjs.
  //
  var FLOAT_ARRAY_TYPE = shrike.FLOAT_ARRAY_TYPE = mjs.FLOAT_ARRAY_TYPE;
  
  shrike.throwError = function(msg) {
    msg = msg || 'undefined error';
    throw new Error('SHRIKE: ' + msg);
  };
  
  shrike.assert = function(cond, msg) {
    if (!cond) {
      shrike.throwError(msg);
    }
  };
  //
  // ##Function: shrike.prettyPrint
  //
  // Pretty printing a matrix. TODO: maybe delete this? it is old and never really used.
  //
  // **Parameters:**
  //
  //   - **x** - whatever it is you're trying to print.
  //
  // **Returns:**
  //
  // nothing
  //
  shrike.prettyPrint = function(x) {
    console.log(function() {
      if (shrike.isArray(x)) {
  
        if (!shrike.is2DArray(x)) {
          var ret = '[ ' + new Array(x).join(', ') + ' ]';
          return ret;
        }
        else {
  
          // find out what the widest number will be
          var precision = 6;
          var widest = 0;
          for (var i = 0; i < x.length; i++) {
            for (var j = 0; j < x[i].length; j++) {
  
              shrike.assert(!_.isString(x[i][j]), 'prettyPrint: there is a string in this matrix, you should fix that');
              if (shrike.round(x[i][j], precision).toString().length > widest) {
                widest = shrike.round(x[i][j], precision).toString().length;
              }
            }
          }
  
          // add spacing and create borders
          var formatted = [];
          var border = undefined;
  
          for (var i = 0; i < x.length; i++) {
            var row = [];
            for (var j = 0; j < x[i].length; j++) {
              var raw = shrike.round(x[i][j], precision).toString();
              var extra_space = widest - raw.length;
              var left = '';
              var right = '';
              for (var k = 0; k < extra_space; k++) {
                if (k >= extra_space / 2.0) {
                  left += ' ';
                }
                else {
                  right += ' ';
                }
              }
              row.push(left + raw + right);
            }
            formatted.push(row);
  
            if (border === undefined) {
              var spacers = [];
              var spacer = '';
              for (var k = 0; k < widest; k++) {
                spacer += '-';
              }
              for (var k = 0; k < row.length; k++) {
                spacers.push(spacer);
              }
              border = '+-' + spacers.join('-+-') + '-+';
            }
          }
  
          // actually print everything
          var ret = border + '\n';
          for (var i = 0; i < x.length; i++) {
            var row = formatted[i];
            var line = '| ' + row.join(' | ') + ' |';
            ret += line + '\n';
            ret += border + '\n';
          }
          return ret;
        }
      }
      else {
  
        // not an array
        return x;
      }
    }());
  };
  window.pp = shrike.prettyPrint;
  
  //
  // ##Function: shrike.isArray
  //
  // A safer version of _.isArray that works with float32 array types.
  //
  // **Parameters:**
  //
  //   - **a** - the array / object / whatever operand.
  //
  // **Returns:**
  //
  // true or false
  //
  shrike.isArray = function(a) {
    if (_.isArray(a)) {
      return true;
    }
  
    return shrike.isTypedArray(a);
  };
  
  //
  // ##Function: shrike.isTypedArray
  //
  // Detects if something is a float array.
  //
  // **Parameters:**
  //
  //   - **a** - the array / object / whatever operand.
  //
  // **Returns:**
  //
  // true or false
  //
  shrike.isTypedArray = function(a) {
    try {
      return (_.isArray(a) !== true) && Object.prototype.toString.call(a).slice(-'Array]'.length) == 'Array]';
    }
    catch (e) {
      return false;
    }
  };
  
  //
  // ##Function: shrike.is2DArray
  //
  // Detects if something is a 2d array.
  //
  // **Parameters:**
  //
  //   - **a** - the array / object / whatever operand.
  //
  // **Returns:**
  //
  // true or false
  //
  shrike.is2DArray = function(a) {
    if (!shrike.isArray(a)) {
      return false;
    }
  
    if (shrike.isTypedArray(a)) {
      return false;
    }
  
    if (a.length === 0) {
      return false;
    }
  
    return _.every(_.map(a, shrike.isArray));
  };
  
  //
  // ##Function: shrike.isNumber
  //
  // Detects if something is a number or numeric type, or can be converted into one.
  //
  // **Parameters:**
  //
  //   - **a** - the operand.
  //
  // **Returns:**
  //
  // true or false
  //
  shrike.isNumber = function(a) {
    return !isNaN(parseFloat(a)) && isFinite(a) && !shrike.isArray(a);
  };
  
  //
  // ##Function: shrike.toFloat
  //
  // Converts the argument to a float value.
  //
  // **Parameters:**
  //
  //   - **thing** - thing you're trying to convert.
  //
  // **Returns:**
  //
  // A new vector containing with the given argument values.
  //
  shrike.toFloat = function(thing) {
  
    // its a number
    if (shrike.isNumber(thing)) {
      return parseFloat(thing);
    }
  
    // its already floating point
    else if (shrike.isTypedArray(thing)) {
      return thing;
    }
  
    // its an array
    else if (shrike.isArray(thing)) {
  
      var _convert = function(thing) {
  
        shrike.assert(shrike.isNumber(thing), 'toFloat: array has something in it that is not a number: ' + thing);
        return parseFloat(thing);
      };
  
      // its a 2d array
      if (shrike.is2DArray(thing)) {
        return _.map(thing, function(row) {
          return new FLOAT_ARRAY_TYPE(_.map(row, _convert));
        });
      }
      else {
        return new FLOAT_ARRAY_TYPE(_.map(thing, _convert));
      }
    }
    else {
      shrike.throwError('toFloat: can not convert to float: ' + thing);
    }
  };
  
  //
  // ##Function: shrike.toUntypedArray
  //
  // Converts the argument to an untyped array.
  //
  // **Parameters:**
  //
  //   - **thing** - thing you're trying to convert.
  //
  // **Returns:**
  //
  // A new plain converted array.
  //
  shrike.toUntypedArray = function(a) {
  
    shrike.assert(shrike.isArray(a), 'toUntypedArray: needs to be a float array or array like object: ' + a);
    if (shrike.isTypedArray(a)) {
      return Array.apply([], a);
    }
    else {
      return a;
    }
  };
  
  //
  // ##Function: shrike.unitConversionScale
  //
  // Return a scale so that X source * scale = Y target.
  //
  // **Parameters:**
  //
  //   - **sourceUnit** - the source unit.
  //   - **targetUnit** - the target unit.
  //
  // **Returns:**
  //
  // float scale.
  //
  shrike.unitConversionScale = function(sourceUnit, targetUnit) {
    var unitDict = {
      m: 1.0,
      meter: 1.0,
      cm: 100.0,
      mm: 1000.0,
      um: 1e6,
      nm: 1e9,
      inch: 39.370078740157481,
      in : 39.370078740157481
    };
    var units = _.keys(unitDict);
  
    shrike.assert(_.contains(units, targetUnit) && _.contains(units, sourceUnit), 'no conversion for either ' + sourceUnit + ' or ' + targetUnit);
    return parseFloat(unitDict[targetUnit] / unitDict[sourceUnit]);
  };
  
  //
  // ##Function: shrike.toDegrees
  //
  // Converts a number, 1 or 2d array of angles in degrees to radians.
  //
  // **Parameters:**
  //
  //   - **x** - the item being converted.
  //
  // **Returns:**
  //
  // the converted value.
  //
  shrike.toDegrees = function(x) {
    var _convert = function(n) {
  
      shrike.assert(shrike.isNumber(n), 'toDegrees: not a number');
      if (shrike.abs(n) <= 1e-10) {
        return 0.0;
      }
      else {
        return (180.0 / shrike.PI) * n;
      }
    };
  
    if (shrike.isNumber(x)) {
      return _convert(x);
    }
    else {
      return shrike.scalarIterator(x, _convert);
    }
  };
  
  //
  // ##Function: shrike.toRadians
  //
  // Converts a number, 1 or 2d array of angles in radians to degrees.
  //
  // **Parameters:**
  //
  //   - **x** - the item being converted.
  //
  // **Returns:**
  //
  // float the converted value.
  //
  shrike.toRadians = function(x) {
    var _convert = function(n) {
  
      shrike.assert(shrike.isNumber(n), 'toRadians: not a number');
      return (shrike.PI / 180.0) * n;
    };
  
    if (shrike.isNumber(x)) {
      return _convert(x);
    }
    else {
      return shrike.scalarIterator(x, _convert);
    }
  };
  
  //
  // ##Function: shrike.matrix4to3
  //
  // Carves out the 3x3 rotation matrix out of a 3x4 or 4x4 transform.
  //
  // **Parameters:**
  //
  //   - **M** - the source matrix.
  //
  // **Returns:**
  //
  // float 3x3 rotation matrix.
  //
  shrike.matrix4to3 = function(M) {
    return [
      new FLOAT_ARRAY_TYPE([M[0][0], M[0][1], M[0][2]]),
      new FLOAT_ARRAY_TYPE([M[1][0], M[1][1], M[1][2]]),
      new FLOAT_ARRAY_TYPE([M[2][0], M[2][1], M[2][2]])
      ];
  };
  
  //
  // ##Function: shrike.composeTransformArray
  //
  // Make a 4x4 transform from a 3x3 rotation matrix and a translation vector.
  //
  // **Parameters:**
  //
  //   - **rot** - the rotation matrix.
  //   - **trans** - the translation vector.
  //
  // **Returns:**
  //
  // float the 4x4 result matrix.
  //
  shrike.composeTransformArray = function(rot, trans) {
    return [
      new FLOAT_ARRAY_TYPE([rot[0][0], rot[0][1], rot[0][2], trans[0]]),
      new FLOAT_ARRAY_TYPE([rot[1][0], rot[1][1], rot[1][2], trans[1]]),
      new FLOAT_ARRAY_TYPE([rot[2][0], rot[2][1], rot[2][2], trans[2]]),
      new FLOAT_ARRAY_TYPE([0.0, 0.0, 0.0, 1.0])
      ];
  };
  
  //
  // ##Function: shrike.decomposeTransformArray
  //
  // Break a 4x4 transform down into a 3x3 rotation matrix and a translation vector.
  //
  // **Parameters:**
  //
  //   - **T** - the source matrix.
  //
  // **Returns:**
  //
  // an object that looks like this
  //
  //     {
  //       rotationMatrix: 3x3 rotation matrix,
  //       translation: [float x, float y, float z],
  //     }
  
  shrike.decomposeTransformArray = function(T) {
    return {
      rotationMatrix: [
        new FLOAT_ARRAY_TYPE([T[0][0], T[0][1], T[0][2]]),
        new FLOAT_ARRAY_TYPE([T[1][0], T[1][1], T[1][2]]),
        new FLOAT_ARRAY_TYPE([T[2][0], T[2][1], T[2][2]])
      ],
      translation: new FLOAT_ARRAY_TYPE([T[0][3], T[1][3], T[2][3]])
    };
  };
  
  //
  // ##Function: shrike.scalarIterator
  //
  // Iterates through an array and applies a function to every element.
  //
  // **Parameters:**
  //
  //   - **A** - 1d or 2d array.
  //   - **_function** - function to be called with each element supplied as its single argument.
  //
  // **Returns:**
  //
  // The modified array.
  //
  shrike.scalarIterator = function(A, _function) {
    _function = _function || pass;
    if (shrike.is2DArray(A)) {
      return _.map(A, function(element) {
        return new FLOAT_ARRAY_TYPE(_.map(element, _function));
      });
    }
    else if (shrike.isArray(A)) {
      var ret = new FLOAT_ARRAY_TYPE(A.length);
      for (var i = 0; i < A.length; i++) {
        ret[i] = _function(A[i]);
      }
      return ret;
    }
    else {
      return _function(A);
    }
  };
  
  //
  // ##Function: shrike.sum
  //
  // Sum up a 1d array.
  //
  // **Parameters:**
  //
  //   - **a** - the array operand.
  //
  // **Returns:**
  //
  // float sum.
  //
  shrike.sum = function(a) {
  
    shrike.assert(shrike.isArray(a), 'can\'t compute sum of non-array ' + a);
    return _.reduce(shrike.toFloat(a), function(memo, num) {
      if (!shrike.isNumber(num)) {
        shrike.throwError('can\'t compute sum of array with non numeric element: ' + num);
      }
  
      return memo + num;
    }, 0.0);
  };
  
  //
  // ##Function: shrike.square
  //
  // Square a number.
  //
  // **Parameters:**
  //
  //   - **x** - the numeric operand.
  //
  // **Returns:**
  //
  // float square.
  //
  shrike.square = function(x) {
  
    shrike.assert(shrike.isNumber(x), 'can\'t square non numeric element: ' + x);
    return parseFloat(x) * parseFloat(x);
  };
  
  //
  // ##Function: shrike.round
  //
  // Round a number to a an arbitrary precision.
  //
  // **Parameters:**
  //
  //   - **x** - numeric operand.
  //   - **dec** - (optional) the number of decimal places, defaults to zero.
  //
  // **Returns:**
  //
  // float rounded number.
  //
  shrike.round = function(n, dec) {
    if (dec === undefined) {
      dec = 0;
    }
  
    shrike.assert(shrike.isNumber(dec), 'round: ' + dec + ' is not valid number of decimal places');
    shrike.assert(dec <= 20, 'round: can only round up to 20 decimal places');
    shrike.assert(shrike.isNumber(n), 'round: ' + n + ' is not a numeric type');
    return parseFloat(new Number(n + '').toFixed(parseInt(dec)));
  };
  
  //
  // ##Function: shrike.roundArray
  //
  // Round each element in an array to a an arbitrary precision.
  //
  // **Parameters:**
  //
  //   - **A** - numeric array operand.
  //   - **dec** - (optional) the number of decimal places, defaults to zero.
  //
  // **Returns:**
  //
  // float rounded array.
  //
  shrike.roundArray = function(A, dec) {
    shrike.throwError(shrike.isArray(A), 'roundArray: not an array');
    return shrike.scalarIterator(A, function(a) {
      return shrike.round(a, dec);
    });
  };
  
  //
  // ##Function: shrike.divide
  //
  // Divides an arbitrarily large 1 or 2d array by a scalar.
  //
  // **Parameters:**
  //
  //   - **A** - the source array.
  //   - **scalar** - scalar that each element in the array will be be divided by.
  //
  // **Returns:**
  //
  // float the result array.
  //
  shrike.divide = function(A, scalar) {
    return shrike.scalarIterator(shrike.toFloat(A), function(a) {
      return a / parseFloat(scalar);
    });
  };
  
  //
  // ##Function: shrike.magnitude
  //
  // Matrix or vector norm.
  //
  // **Parameters:**
  //
  //   - **a** - source.
  //
  // **Returns:**
  //
  // float
  //
  shrike.magnitude = function(a) {
    if (shrike.isTypedArray(a)) {
  
      shrike.assert(a.length === 3 || a.length === 4, 'magnitude: native float array\'s need to be of length 3 or 4');
      if (a.length === 3) {
        return shrike.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
      }
      else if (a.length === 4) {
        return shrike.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3]);
      }
      else {
        shrike.throwError('magnitude: incorrect native float array length');
      }
    }
    return shrike.sqrt(shrike.sum(_.map(shrike.toFloat(a), shrike.square)));
  };
  
  shrike.norm = shrike.magnitude;
  
  //
  // ##Function: shrike.normalize
  //
  // Matrix or vector normalization.
  // TODO: make a V3.normalize
  //
  // **Parameters:**
  //
  //   - **a** - source.
  //
  // **Returns:**
  //
  // float normalized array or matrix
  //
  shrike.normalize = function(array) {
    var length = shrike.magnitude(array);
  
    shrike.assert(length !== 0, 'normalize: trying to normalize a zero array');
    return shrike.divide(array, length);
  };
  
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
  
  //
  // ##Function: shrike.V3.fromObject
  //
  // Converts an object with xyz attributes into a V3.
  //
  // **Parameters:**
  //
  //   - **o** - the source object.
  //
  // **Returns:**
  //
  // float the result V3.
  //
  shrike.V3.fromObject = function(o) {
  
    shrike.assert(_.isObject(o), 'not an object');
    return new FLOAT_ARRAY_TYPE([o.x, o.y, o.z]);
  };
  
  //
  // ##Function: shrike.V3.toObject
  //
  // Converts a V3 into an object with xyz attributes.
  //
  // **Parameters:**
  //
  //   - **_v** - the source V3.
  //
  // **Returns:**
  //
  // float the result object.
  //
  shrike.V3.toObject = function(_v) {
  
    shrike.assert(shrike.isArray(_v), 'not an array');
    var v = shrike.toFloat(_v);
    return _.object(['x', 'y', 'z'], v);
  };
  
  shrike.V3.zxy = {};
  shrike.V3.zyx = {};
  
  //
  // ##Function: shrike.V3.zxy.fromMatrix
  //
  // Convert a matrix into zxy angle representation.
  //
  // **Parameters:**
  //
  //   - **Traw** - the matrix being converted.
  //
  // **Returns:**
  //
  // float the converted array of angles (angles are is in degrees).
  //
  shrike.V3.zxy.fromMatrix = function(Traw) {
  
    var T = shrike.matrix4to3(shrike.toFloat(Traw));
  
    var epsilon = 1e-10;
  
    var x, y, z;
    if ((Math.abs(T[2][0]) < epsilon) && (Math.abs(T[2][2]) < epsilon)) {
      var sinx = T[2][1];
      if (sinx > 0.0) {
        x = Math.PI / 2.0;
      }
      else {
        x = -Math.PI / 2.0;
      }
      z = 0.0;
      y = Math.atan2(sinx * T[1][0], T[0][0]);
    }
    else {
      y = Math.atan2(-T[2][0], T[2][2]);
      var siny = Math.sin(y);
      var cosy = Math.cos(y);
      var Ryinv = [
      [cosy, 0.0, -siny],
      [0.0, 1.0, 0.0],
      [siny, 0.0, cosy]
    ];
      var Rzx = shrike.matrixMult(T, Ryinv);
      x = Math.atan2(Rzx[2][1], Rzx[2][2]);
      z = Math.atan2(Rzx[1][0], Rzx[0][0]);
    }
    return shrike.toDegrees([x, y, z]);
  };
  
  //
  // ##Function: shrike.V3.zyx.fromMatrix
  //
  // Convert a matrix into zyx angle representation.
  //
  // **Parameters:**
  //
  //   - **Traw** - the matrix being converted.
  //
  // **Returns:**
  //
  // float the converted array of angles (angles are is in degrees).
  //
  shrike.V3.zyx.fromMatrix = function(Traw) {
    var T = shrike.toFloat(Traw);
    var epsilon = 1e-10;
    var x, y, z;
  
    if ((Math.abs(T[2][1]) < epsilon) && (Math.abs(T[2][2]) < epsilon)) {
      if (T[2][0] <= 0.0) {
        y = Math.PI / 2.0;
      }
      else {
        y = -Math.PI / 2.0;
      }
      if (y > 0.0) {
        var xminusz = Math.atan2(T[0][1], T[1][1]);
        x = xminusz;
        z = 0.0;
      }
      else {
        var xplusz = -Math.atan2(T[0][1], T[1][1]);
        x = xplusz;
        z = 0.0;
      }
    }
    else {
      x = Math.atan2(T[2][1], T[2][2]);
      var sinx = Math.sin(x);
      var cosx = Math.cos(x);
      var Rxinv = [[1.0, 0.0, 0.0], [0.0, cosx, sinx], [0.0, -sinx, cosx]];
      var Rzy = shrike.matrixMult(shrike.matrix4to3(T), Rxinv);
      y = Math.atan2(-Rzy[2][0], Rzy[2][2]);
      z = Math.atan2(-Rzy[0][1], Rzy[1][1]);
    }
  
    return shrike.toDegrees([x, y, z]);
  };
  
  //
  // ##Function: shrike.V3.zxy.fromQuat
  //
  // Convert a quaternion into zxy representation.
  //
  // **Parameters:**
  //
  //   - **quat** - the quaternion being converted.
  //
  // **Returns:**
  //
  // float the converted array of angles (angles are is in degrees).
  //
  shrike.V3.zxy.fromQuat = function(quat) {
    return shrike.V3.zxy.fromMatrix(shrike.matrixFromQuat(shrike.toFloat(quat)));
  };
  
  //
  // ##Function: shrike.V3.zyx.fromQuat
  //
  // Convert a quaternion into zxy representation.
  //
  // **Parameters:**
  //
  //   - **quat** - the quaternion being converted.
  //
  // **Returns:**
  //
  // float the converted array of angles (angles are is in degrees).
  //
  shrike.V3.zyx.fromQuat = function(quat) {
    return shrike.V3.zyx.fromMatrix(shrike.matrixFromQuat(shrike.toFloat(quat)));
  };
  
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
  
    shrike.assert(quatRaw.length === 4, 'M4.fromQuat: quatRaw.length !== 4');
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
  // ##Function: shrike.M4.translation
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
  shrike.M4.translation = function(m) {
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
  
    shrike.assert(trans.length === 3, 'M4.composeFromQuatTrans: trans.length !== 3');
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
  
  //
  // ##Function: shrike.linearlyInterpolate
  //
  // Linearly interpolate between t0, x0 and t1, x1 at time t.
  // Requires t0, t1 to be distinct
  //
  // **Parameters:**
  //
  //   - **t0** - time 0.
  //   - **x0** - position 0.
  //   - **t1** - time 1.
  //   - **x1** - position 1.
  //   - **t** - time.
  //
  // **Returns:**
  //
  // float the result object.
  //
  shrike.linearlyInterpolate = function(t0, x0, t1, x1, t) {
    return (x0 * (t1 - t) + x1 * (t - t0)) / (t1 - t0);
  };
  
  shrike.geom = {};
  
  shrike.geom.canvasToViewport = function(canvasX, canvasY, canvasWidth, canvasHeight, viewportAspectRatio) {
    var viewportX = ((canvasX / canvasWidth) - 0.5) * viewportAspectRatio;
    var viewportY = 0.5 - (canvasY / canvasHeight);
    return [viewportX, viewportY];
  };
  
  shrike.geom.getProjectionScale = function(depth, fovDegrees) {
    return 2.0 * depth * Math.tan(0.5 * shrike.toRadians(fovDegrees));
  };
  
  shrike.geom.viewportToWorldVec = function(viewportX, viewportY, right, up, look, fovy) {
    var scale = shrike.geom.getProjectionScale(1.0, fovy);
    return shrike.V3.add(shrike.V3.scale(right, viewportX * scale), shrike.V3.add(shrike.V3.scale(up, viewportY * scale), look));
  };
  
  /*
   * given two lines, p + v*t, and q + w*s (parameterized by t and s respectively),
   * find the respective points on the lines, the distance between which is minimized.
   * return [t_min, s_min], where p + v*t_min and q + w*s_min are these two points.
   *
   * note that these formulas came out of mathematica, and are therefore pretty opaque.
   *
   * FIXME: this can be simplified if v and w are assumed to be unit vectors
   * FIXME: add mathematica code
   */
  shrike.geom.findShortestDistanceBetweenLines = function(p, v, q, w) {
    var c = shrike.V3.sub(p, q);
  
    var vDotW = shrike.V3.dot(v, w);
  
    var tNumerator = 4.0 * (shrike.V3.dot(c, v) * shrike.V3.dot(w, w) - shrike.V3.dot(c, w) * shrike.V3.dot(v, w));
    var tDenominator = 4.0 * (vDotW * vDotW - shrike.V3.dot(v, v) * shrike.V3.dot(w, w));
  
    var sNumerator = c[2] * (-v[0] * v[2] * w[0] - v[1] * v[2] * w[1] + v[0] * v[0] * w[2] + v[1] * v[1] * w[2]) + c[0] * (v[1] * v[1] * w[0] + v[2] * v[2] * w[0] - v[0] * v[1] * w[1] - v[0] * v[2] * w[2]) + c[1] * (-v[0] * v[1] * w[0] + v[0] * v[0] * w[1] + v[2] * (v[2] * w[1] - v[1] * w[2]));
  
    var sDenominator = v[2] * v[2] * (w[0] * w[0] + w[1] * w[1]) - 2.0 * v[0] * v[2] * w[0] * w[2] - 2.0 * v[1] * w[1] * (v[0] * w[0] + v[2] * w[2]) + v[1] * v[1] * (w[0] * w[0] + w[2] * w[2]) + v[0] * v[0] * (w[1] * w[1] + w[2] * w[2]);
  
    // FIXME: this should be good enough, but i'm not sure yet what the best behavior here is
    if (Math.abs(tDenominator) < 1e-10 || Math.abs(sDenominator) < 1e-10) {
      return {
        t: 0.0,
        s: 0.0
      };
    }
  
    return {
      t: tNumerator / tDenominator,
      s: sNumerator / sDenominator
    };
  };
  
  // is there a better way to do this? maybe. but this works.
  shrike.geom.findPerpVector = function(v) {
    var vn = shrike.V3.normalize(v);
    var dotProds = [shrike.V3.dot(vn, shrike.V3.$(1, 0, 0)),
                    shrike.V3.dot(vn, shrike.V3.$(0, 1, 0)),
                    shrike.V3.dot(vn, shrike.V3.$(0, 0, 1))];
    var index = dotProds.indexOf(Math.min.apply(undefined, dotProds));
    var crossUnitVec;
  
    crossUnitVec = shrike.V3.$(0, 0, 0);
    crossUnitVec[index] = 1.0;
  
    return shrike.V3.normalize(shrike.V3.cross(vn, crossUnitVec));
  };
  
  shrike.geom.getCameraZoom = function(options) {
    var wheelDelta = options.wheelDelta;
    var eye = options.eye;
    var lookAtPoint = options.lookAtPoint;
    var zoomScale = options.zoomScale;
  
    var forward = shrike.V3.sub(lookAtPoint, eye);
    var zoomedForward = shrike.V3.scale(forward, (wheelDelta > 0) ? Math.pow(zoomScale, wheelDelta) : Math.pow(1 / zoomScale, -wheelDelta));
    var zoomedEye = shrike.V3.sub(lookAtPoint, zoomedForward);
  
    return zoomedEye;
  };
  
  shrike.geom.getRotationBetweenNormalizedVectors = function(u, v) {
    var crossProd = shrike.V3.cross(u, v);
    var absSinAngle = shrike.V3.length(crossProd);
    var cosAngle = shrike.V3.dot(u, v);
    var angle;
  
    if (absSinAngle < 1e-16) {
      return {
        axis: shrike.V3.$(0, 0, 0),
        angle: 0.0
      };
    }
  
    if (cosAngle >= 0.0) {
  
      // Angle is in [-PI/2, +PI/2]
      angle = Math.asin(absSinAngle);
    }
    else {
  
      // Angle is in [-PI, -PI/2) or (+PI/2, +PI]
      angle = Math.PI - Math.asin(absSinAngle);
    }
  
    return {
      axis: shrike.V3.normalize(crossProd),
      angle: angle
    };
  };
  
  // quick background: there are cases when, given a perspective camera and a depth
  //                   (z value), and given an (x,y) point on the screen, we want
  //                   to find the world-space point at that depth to which (x,y)
  //                   maps. in other words we need to do the inverse perspective
  //                   transform. that inverse perspective transform maps z in [-1,+1]
  //                   to z in [-nearDepth, -farDepth]. so we need that z in [-1,+1]
  //                   to apply the inverse perspective transform matrix.
  //
  // so what this does: given the true world-space depth, i.e. z in [-nearDepth, -farDepth],
  //                    return the projected z value, i.e. z in [-1, +1], to which the
  //                    perspective transform maps it.
  //
  // and so, FIXME:
  // yes, this is a little silly/wasteful. we map z -> z' so that we can then
  // map [x', y', z'] back to [x, y, z] with P^-1. an optimized method
  // would just do the partial inverse application.
  //
  shrike.geom.getPerspectiveDepthForSceneDepth = function(sceneDepth, nearDepth, farDepth) {
    return ((farDepth + nearDepth) / (farDepth - nearDepth)) + ((2 * farDepth * nearDepth) / ((farDepth - nearDepth) * sceneDepth));
  };
  
  shrike.geom.getPointOnPlane = function(canvasX, canvasY, canvasWidth, canvasHeight, viewVecs, fovX, fovY, planeNormal, planeBias) {
    var viewportPos = shrike.geom.canvasToViewport(canvasX, canvasY, canvasWidth, canvasHeight, 1.0); // FIXME: use correct aspect (may not be 1.0)
    var worldVec = shrike.geom.viewportToWorldVec(viewportPos[0], viewportPos[1], viewVecs.right, viewVecs.up, viewVecs.look, fovX, fovY);
  
    var t = (-planeBias - shrike.V3.dot(viewVecs.eye, planeNormal)) / shrike.V3.dot(worldVec, planeNormal);
    var p = shrike.V3.add(shrike.V3.scale(worldVec, t), viewVecs.eye);
  
    return p;
  };
  
  // options.x in [-1, +1]
  // options.y in [-1, +1]
  // options.fovY in degrees
  shrike.geom.projectScreenPointToWorldPointAtDepth = function(options) {
    var x = options.x;
    var y = options.y;
    var z = options.z;
    var fovY = options.fovY;
    var aspect = options.aspect;
    var zNear = options.zNear;
    var zFar = options.zFar;
  
    var zProj = shrike.geom.getPerspectiveDepthForSceneDepth(z, zNear, zFar);
    var projMat = shrike.M4.makePerspective(fovY, aspect, zNear, zFar);
    var invProjMat = shrike.M4.inverse(projMat);
  
    return shrike.V3.mul4x4(invProjMat, shrike.V3.$(x, y, zProj));
  };
  
  // assumes that the two cameras are the same
  shrike.geom.projectWorldPointToWorldPointAtDepth = function(options) {
    var x = options.x;
    var y = options.y;
    var z = options.z;
    var newDepth = options.newDepth;
    var fovY = options.fovY;
    var aspect = options.aspect;
    var zNear = options.zNear;
    var zFar = options.zFar;
    var eye = options.eye;
    var lookAtPoint = options.lookAtPoint;
    var up = options.up;
  
    var projMat = shrike.M4.makePerspective(fovY, aspect, zNear, zFar);
    var invProjMat = shrike.M4.inverse(projMat);
    var lookAtMat = shrike.M4.makeLookAt(eye, lookAtPoint, up);
    var invLookAtMat = shrike.M4.inverse(lookAtMat);
  
    var projPoint = shrike.V3.mul4x4(projMat, shrike.V3.mul4x4(lookAtMat, shrike.V3.$(x, y, z)));
  
    projPoint[2] = shrike.geom.getPerspectiveDepthForSceneDepth(newDepth, zNear, zFar);
  
    return shrike.V3.mul4x4(invLookAtMat, shrike.V3.mul4x4(invProjMat, projPoint));
  };
  
  // FIXME: get rid of fovX
  shrike.geom.viewportToWorldVec = function(viewportX, viewportY, right, up, look, fovX, fovY) {
    var scaleX = shrike.geom.getProjectionScale(1.0, fovX);
    var scaleY = shrike.geom.getProjectionScale(1.0, fovY);
  
    return shrike.V3.add(shrike.V3.scale(right, viewportX * scaleX), shrike.V3.add(shrike.V3.scale(up, viewportY * scaleY), look));
  };
  
  shrike.geom.getCameraOrbitRotation = function(options) {
    var horizRot = options.horizRot;
    var vertRot = options.vertRot;
    var up = options.up;
    var eye = options.eye;
    var lookAtPoint = options.lookAtPoint;
    var rotationCenter = options.rotationCenter;
    var dragConstant = options.dragConstant;
  
    if (horizRot == 0 && vertRot == 0) {
      return {
        eye: eye,
        lookAtPoint: lookAtPoint,
        up: up
      };
    }
  
    var forward = shrike.V3.sub(lookAtPoint, eye);
    var right = shrike.V3.normalize(shrike.V3.cross(forward, up));
    var fixedUp = shrike.V3.normalize(shrike.V3.cross(right, forward));
  
    var rotVec = shrike.V3.add(shrike.V3.scale(fixedUp, -horizRot), shrike.V3.scale(right, -vertRot));
    var rotMat = shrike.M4.makeRotate(shrike.V3.length(rotVec) * dragConstant, rotVec);
  
    var eyeFromCenter = shrike.V3.sub(eye, rotationCenter);
    var lookFromCenter = shrike.V3.sub(lookAtPoint, rotationCenter);
  
    var newEyeFromCenter = shrike.V3.mul4x4(rotMat, eyeFromCenter);
    var newLookFromCenter = shrike.V3.mul4x4(rotMat, lookFromCenter);
  
    return {
      eye: shrike.V3.add(newEyeFromCenter, rotationCenter),
      lookAtPoint: shrike.V3.add(newLookFromCenter, rotationCenter),
      up: shrike.V3.mul4x4(rotMat, fixedUp)
    };
  };
  
  shrike.geom.getCameraStrafe = function(options) {
    var horizTrans = options.horizTrans;
    var vertTrans = options.vertTrans;
    var up = options.up;
    var eye = options.eye;
    var lookAtPoint = options.lookAtPoint;
    var dragConstant = options.dragConstant;
  
    var forward = shrike.V3.sub(lookAtPoint, eye);
    var right = shrike.V3.normalize(shrike.V3.cross(forward, up));
    var fixedUp = shrike.V3.normalize(shrike.V3.cross(right, forward));
  
    var trans = shrike.V3.add(shrike.V3.scale(fixedUp, vertTrans * dragConstant), shrike.V3.scale(right, -horizTrans * dragConstant));
  
    return {
      eye: shrike.V3.add(eye, trans),
      lookAtPoint: shrike.V3.add(lookAtPoint, trans)
    };
  };
  

  // for debugging / console convenience
  if (window.makeGlobal !== undefined) {
    window.makeGlobal(shrike);
    window.makeGlobal({
      math: shrike,
      shrike: shrike
    });
  }

  return shrike;
});
