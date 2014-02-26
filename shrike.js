// shrike - v0.0.0
//
// https://github.com/Stonelinks/shrike
//
// yet another javascript math library
//
// Copyright (c)2014 Lucas Doyle <lucas.p.doyle@gmail.com>
//
// Distributed under MIT license
//


define(['underscore', 'mjs'], function(_, mjs) {
  'use strict';

  var shrike = {};

  // shrike utility functions, mostly for registering and detecting types
  
  window.pass = window.pass || function() {};
  
  shrike.throwError = function(msg) {
    msg = msg || 'undefined error';
    throw new Error('SHRIKE: ' + msg);
  };
  
  var SHRIKE_DO_ASSERT = true;
  
  if (SHRIKE_DO_ASSERT && (window.hasOwnProperty('DEBUG') ? window.DEBUG : SHRIKE_DO_ASSERT)) {
    shrike.assert = function(cond, msg) {
      if (!cond) {
        shrike.throwError(msg);
      }
    };
  }
  else {
    shrike.assert = window.pass;
  }
  
  // set a (sometimes nested) property on the shrike object, warn if it conflicts
  shrike.register = function(k, v) {
  
    // keys can be compound
    var keys = k.split('.').reverse();
    if (keys.length == 1) {
      shrike.assert(!shrike.hasOwnProperty(k), 'shrike already has a ' + k);
      shrike[k] = v;
    }
    else {
      var lastKey = keys[0];
      var prop = shrike;
      while (keys.length > 0) {
  
        var thisKey = keys.pop();
  
        shrike.assert(!(prop.hasOwnProperty(thisKey) && !_.isObject(prop[thisKey])), 'shrike already has a ' + k);
  
        if (thisKey === lastKey) {
          prop[thisKey] = v;
        }
        else {
  
          if (!_.isObject(prop[thisKey])) {
            prop[thisKey] = {};
          }
  
          prop = prop[thisKey];
        }
      }
    }
  };
  
  // TODO: make it so you can alias things with depth >1
  shrike.alias = function(newName, orig) {
    shrike.assert(shrike.hasOwnProperty(orig), 'shrike doesn\'t have a ' + orig + ' to alias');
    shrike.register(newName, shrike[orig]);
  };
  
  // safe version of isArray
  shrike.register('isArray', function(thing) {
    if (_.isArray(thing)) {
      return true;
    }
  
    return shrike.isNativeFloatArray(thing);
  });
  
  // checks for special array types
  shrike.register('isNativeFloatArray', function(thing) {
    try {
      return (_.isArray(thing) !== true) && Object.prototype.toString.call(thing).slice(-'Array]'.length) == 'Array]';
    }
    catch (e) {
      return false;
    }
  });
  
  shrike.register('is2DArray', function(thing) {
    if (!shrike.isArray(thing)) {
      return false;
    }
  
    if (shrike.isNativeFloatArray(thing)) {
      return false;
    }
  
    if (thing.length === 0) {
      return false;
    }
  
    return _.every(_.map(thing, shrike.isArray));
  });
  
  shrike.register('isNumber', function(thing) {
    return !isNaN(parseFloat(thing)) && isFinite(thing) && !shrike.isArray(thing);
  });
  
  // for pretty printing a matrix
  // TODO: maybe delete this? it is old and never really used
  shrike.register('prettyPrint', function(x) {
  
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
  });
  window.pp = shrike.prettyPrint;
  
  // various ways of iterating through arrays
  
  // applies a function to every element in A
  // input can be a string, integer, 1d or 2d array
  // if its a string or integer, the function will just be called once
  shrike.register('scalarIterator', function(A, _function) {
    _function = _function || pass;
    if (shrike.is2DArray(A)) {
      return _.map(A, function(element) {
        return _.map(element, _function);
      });
    }
    else if (shrike.isArray(A)) {
      if (shrike.isNativeFloatArray(A)) {
        var ret = new shrike.FLOAT_ARRAY_TYPE(A.length);
        for (var i = 0; i < A.length; i++) {
          ret[i] = _function(A[i]);
        }
        return ret;
      }
      else {
        return _.map(A, _function);
      }
    }
    else {
      return _function(A);
    }
  });
  
  // assign base properites to shrike
  
  // borrow all of Math's functions and constants... except round since shrike provides its own round function
  _.without(Object.getOwnPropertyNames(Math), 'round').forEach(function(prop) {
    shrike.register(prop, Math[prop]);
  });
  
  // borrow mjs too
  Object.getOwnPropertyNames(mjs).forEach(function(prop) {
    shrike.register(prop, mjs[prop]);
  });
  
  // alias M4x4 to M4 since it is shorter to type
  shrike.alias('M4', 'M4x4');
  
  // things common to both M4, V3 or all arrays in general
  
  // sum an array
  shrike.register('sum', function(arr) {
    shrike.assert(shrike.isArray(arr), 'can\'t compute sum of non-array ' + arr);
  
    return _.reduce(shrike.toFloat(arr), function(memo, num) {
      if (!shrike.isNumber(num)) {
        shrike.throwError('can\'t compute sum of array with non numeric element: ' + num);
      }
  
      return memo + num;
    }, 0.0);
  });
  
  shrike.register('square', function(x) {
    shrike.assert(shrike.isNumber(x), 'can\'t square non numeric element: ' + x);
    return parseFloat(x) * parseFloat(x);
  });
  
  shrike.register('round', function(n, dec) {
    dec = dec || 0;
  
    shrike.assert(dec <= 20, 'round: can only round to 20 decimal places');
    shrike.assert(shrike.isNumber(n), 'round: ' + n + ' is not a numeric type');
  
    return parseFloat(new Number(n + '').toFixed(parseInt(dec)));
  });
  
  shrike.register('roundArray', function(A, dec) {
    shrike.throwError(shrike.isArray(A), 'roundArray: not an array');
    return shrike.scalarIterator(A, function(a) {
      return shrike.round(a, dec);
    });
  });
  
  // data conversion
  
  shrike.register('toFloat', function(thing) {
  
    // its a number
    if (shrike.isNumber(thing)) {
      return parseFloat(thing);
    }
  
    // its already floating point
    else if (shrike.isNativeFloatArray(thing)) {
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
          return _.map(row, _convert);
        });
      }
      else {
        return _.map(thing, _convert);
      }
    }
    else {
      shrike.throwError('toFloat: can not convert to float: ' + thing);
    }
  });
  
  /* return a scale so that X source * scale = Y target */
  /* this function mirrors GetUnitConversionScale in mujin/dev/mujin/__init__.py */
  shrike.register('unitConversionScale', function(sourceUnit, targetUnit) {
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
  });
  
  shrike.register('toDegrees', function(x) {
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
  });
  
  shrike.register('toRadians', function(x) {
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
  });
  
  // parses an axis and an angle from some arguments
  // input can be an object with axis and angle properties
  // or an array of 3 values for the axis and an angle as the second argument
  // or an array of 4 values, first three being axis and the last one angle
  shrike.register('parseAxisAngle', function(axis, angle) {
    var _axis;
    var _angle;
    var _throwError = function() {
      shrike.throwError('parseAxisAngle: arguments were not something we recognized');
    };
  
    if (shrike.isArray(axis)) {
      if (axis.length == 4 && angle === undefined) {
        _axis = axis.slice(0, 3);
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
      angle: shrike.toFloat(_angle)
    };
  });
  
  // convert a quaternion from axis angle (radians)
  shrike.register('quatFromAxisAngle', function(_axis, _angle) {
    var aa = shrike.parseAxisAngle(_axis, _angle);
    var axis = aa.axis;
    var angle = aa.angle;
  
    var axisLength = shrike.sum(_.map(axis, shrike.square));
    if (axisLength <= 1e-10) {
      return [1.0, 0.0, 0.0, 0.0];
    }
    var halfangle = angle / 2.0;
    var sinangle = Math.sin(halfangle) / Math.sqrt(axisLength);
  
    // TODO: return a float array
    return [Math.cos(halfangle), axis[0] * sinangle, axis[1] * sinangle, axis[2] * sinangle];
  });
  
  shrike.register('quatFromMatrix', function(Traw) {
  
    var T = shrike.toFloat(Traw);
  
    var tr = T[0][0] + T[1][1] + T[2][2];
    var rot = [0.0, 0.0, 0.0, 0.0];
    if (tr >= 0.0) {
      rot[0] = tr + 1.0;
      rot[1] = (T[2][1] - T[1][2]);
      rot[2] = (T[0][2] - T[2][0]);
      rot[3] = (T[1][0] - T[0][1]);
    }
    else {
  
      // find the largest diagonal element and jump to the appropriate case
      if (T[1][1] > T[0][0]) {
        if (T[2][2] > T[1][1]) {
          rot[3] = (T[2][2] - (T[0][0] + T[1][1])) + 1.0;
          rot[1] = (T[2][0] + T[0][2]);
          rot[2] = (T[1][2] + T[2][1]);
          rot[0] = (T[1][0] - T[0][1]);
        }
        else {
          rot[2] = (T[1][1] - (T[2][2] + T[0][0])) + 1.0;
          rot[3] = (T[1][2] + T[2][1]);
          rot[1] = (T[0][1] + T[1][0]);
          rot[0] = (T[0][2] - T[2][0]);
        }
      }
      else if (T[2][2] > T[0][0]) {
        rot[3] = (T[2][2] - (T[0][0] + T[1][1])) + 1.0;
        rot[1] = (T[2][0] + T[0][2]);
        rot[2] = (T[1][2] + T[2][1]);
        rot[0] = (T[1][0] - T[0][1]);
      }
      else {
        rot[1] = (T[0][0] - (T[1][1] + T[2][2])) + 1.0;
        rot[2] = (T[0][1] + T[1][0]);
        rot[3] = (T[2][0] + T[0][2]);
        rot[0] = (T[2][1] - T[1][2]);
      }
    }
  
    return shrike.divide(rot, shrike.magnitude(rot));
  });
  
  shrike.register('matrixFromQuat', function(quatRaw) {
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
  });
  
  // angle is returned in radians
  shrike.register('axisAngleFromQuat', function(quatraw) {
  
    var quat = shrike.toFloat(quatraw);
    var sinang = shrike.sum(_.map(quat.slice(1, 4), shrike.square));
  
    var identity = {
      axis: [1.0, 0.0, 0.0],
      angle: 0.0
    };
    if (sinang === 0.0) {
      return identity;
    }
    else if (quat[0] * quat[0] + sinang <= 1e-8) {
      throw new Error('invalid quaternion ' + quat);
    }
    var _quat;
    if (quat[0] < 0.0) {
      _quat = [-quat[0], -quat[1], -quat[2], -quat[3]];
    }
    else {
      _quat = quat;
    }
    sinang = Math.sqrt(sinang);
    var f = 1.0 / sinang;
  
    var angle = 2.0 * Math.atan2(sinang, _quat[0]);
    return {
      axis: [_quat[1] * f, _quat[2] * f, _quat[3] * f],
      angle: angle
    };
  });
  
  shrike.register('axisAngleFromMatrix', function(m) {
    return shrike.axisAngleFromQuat(shrike.quatFromMatrix(m));
  });
  
  shrike.register('zxyFromMatrix', function(Traw) {
  
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
  });
  
  shrike.register('zyxFromMatrix', function(Traw) {
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
  });
  
  shrike.register('matrixFromZXY', function(ZXY) {
  
    var x = shrike.toRadians(parseFloat(ZXY[0]));
    var y = shrike.toRadians(parseFloat(ZXY[1]));
    var z = shrike.toRadians(parseFloat(ZXY[2]));
    return [
    [
      -Math.sin(x) * Math.sin(y) * Math.sin(z) + Math.cos(y) * Math.cos(z),
      -Math.sin(z) * Math.cos(x),
      Math.sin(x) * Math.sin(z) * Math.cos(y) + Math.sin(y) * Math.cos(z)
    ], [
      Math.sin(x) * Math.sin(y) * Math.cos(z) + Math.sin(z) * Math.cos(y),
      Math.cos(x) * Math.cos(z),
      -Math.sin(x) * Math.cos(y) * Math.cos(z) + Math.sin(y) * Math.sin(z)
    ], [
      -Math.sin(y) * Math.cos(x),
      Math.sin(x),
      Math.cos(x) * Math.cos(y)
    ]
      ];
  });
  
  shrike.register('matrixFromZYX', function(ZYX) {
    var x = shrike.toRadians(parseFloat(ZYX[0]));
    var y = shrike.toRadians(parseFloat(ZYX[1]));
    var z = shrike.toRadians(parseFloat(ZYX[2]));
    return [
    [
      Math.cos(y) * Math.cos(z),
      -Math.cos(x) * Math.sin(z) + Math.cos(z) * Math.sin(x) * Math.sin(y),
      Math.sin(x) * Math.sin(z) + Math.cos(x) * Math.cos(z) * Math.sin(y)
    ], [
      Math.cos(y) * Math.sin(z),
      Math.cos(x) * Math.cos(z) + Math.sin(x) * Math.sin(y) * Math.sin(z),
      -Math.cos(z) * Math.sin(x) + Math.cos(x) * Math.sin(y) * Math.sin(z)
    ], [
      -Math.sin(y),
      Math.cos(y) * Math.sin(x),
      Math.cos(x) * Math.cos(y)
    ]
      ];
  });
  
  shrike.register('zxyFromQuat', function(quat) {
    return shrike.zxyFromMatrix(shrike.matrixFromQuat(shrike.toFloat(quat)));
  });
  
  shrike.register('quatFromZXY', function(zxy) {
    return shrike.quatFromMatrix(shrike.matrixFromZXY(shrike.toFloat(zxy)));
  });
  
  shrike.register('zyxFromQuat', function(quat) {
    return shrike.zyxFromMatrix(shrike.matrixFromQuat(shrike.toFloat(quat)));
  });
  
  shrike.register('quatFromZYX', function(zyx) {
    return shrike.quatFromMatrix(shrike.matrixFromZYX(shrike.toFloat(zyx)));
  });
  
  // carves out the 3x3 rotation matrix out of a 3x4 or 4x4 transform
  shrike.register('matrix4to3', function(M) {
    return [[M[0][0], M[0][1], M[0][2]], [M[1][0], M[1][1], M[1][2]], [M[2][0], M[2][1], M[2][2]]];
  });
  
  shrike.register('composeTransformArray', function(rot, trans) {
    return [[rot[0][0], rot[0][1], rot[0][2], trans[0]], [rot[1][0], rot[1][1], rot[1][2], trans[1]], [rot[2][0], rot[2][1], rot[2][2], trans[2]], [0.0, 0.0, 0.0, 1.0]];
  });
  
  shrike.register('decomposeTransformArray', function(T) {
    return {
      rotationMatrix: [T[0].slice(0, 3), T[1].slice(0, 3), T[2].slice(0, 3)],
      translation: [T[0][3], T[1][3], T[2][3]]
    };
  });
  
  // TODO move into M4 namespace as toTransformArray and fromTransformArray
  shrike.register('M4toTransformArray', function(m) {
    return [[m[0], m[4], m[8], m[12]], [m[1], m[5], m[9], m[13]], [m[2], m[6], m[10], m[14]], [m[3], m[7], m[11], m[15]]];
  });
  
  shrike.register('transformArrayToM4', function(m) {
    return [m[0][0], m[1][0], m[2][0], m[3][0], m[0][1], m[1][1], m[2][1], m[3][1], m[0][2], m[1][2], m[2][2], m[3][2], m[0][3], m[1][3], m[2][3], m[3][3]];
  });
  
  // common matrix operations
  
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
  
  // functions to augment mjs's V3 vector
  
  shrike.register('V3.objectToArray', function(o) {
    shrike.assert(_.isObject(o), 'not an object');
    return ['x', 'y', 'z'].map(function(p) {
      return o[p];
    });
  });
  
  shrike.register('V3.arrayToObject', function(_v) {
    shrike.assert(shrike.isArray(_v), 'not an array');
    var v = shrike.toFloat(_v);
    return _.object(['x', 'y', 'z'], v);
  });
  
  // functions to augment mjs's 4x4 matrix
  
  shrike.register('M4.matrixFromQuat', function(quatRaw) {
    shrike.assert(quatRaw.length === 4, 'M4.matrixFromQuat: quatRaw.length !== 4');
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
  });
  
  shrike.register('M4.quatFromMatrix', function(_m) {
  
    var m = shrike.toFloat(_m);
  
    var m11 = m[0];
    var m21 = m[1];
    var m31 = m[2];
    // var m41 = m[3];
    var m12 = m[4];
    var m22 = m[5];
    var m32 = m[6];
    // var m42 = m[7];
    var m13 = m[8];
    var m23 = m[9];
    var m33 = m[10];
    // var m43 = m[11];
    // var m14 = m[12];
    // var m24 = m[13];
    // var m34 = m[14];
    // var m44 = m[15];
  
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
  });
  
  shrike.register('M4.transFromMatrix', function(m) {
    // var r = new shrike.FLOAT_ARRAY_TYPE(3);
  
    // TODO use native array type here...
    var r = new Array(3);
    r[0] = m[12];
    r[1] = m[13];
    r[2] = m[14];
    return r;
  });
  
  // composes an instance from a quaternion and translation V3
  shrike.register('M4.composeFromQuatTrans', function(quatRaw, transRaw) {
    var r = shrike.M4.matrixFromQuat(quatRaw);
  
    var trans = shrike.toFloat(transRaw);
  
    shrike.assert(trans.length === 3, 'M4.composeFromQuatTrans: trans.length !== 3');
  
    r[12] = trans[0];
    r[13] = trans[1];
    r[14] = trans[2];
  
    return r;
  });
  
  // requires t0, t1 to be distinct
  shrike.register('linearlyInterpolate', function(t0, x0, t1, x1, t) {
    return (x0 * (t1 - t) + x1 * (t - t0)) / (t1 - t0);
  });
  

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
