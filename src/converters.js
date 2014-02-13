define([

  'underscore'

], function(_) {
  'use strict';

  return function(shrike) {

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
        inch: 39.370078740157481
      };
      var units = _.keys(unitDict);
      if (_.contains(units, targetUnit) && _.contains(units, sourceUnit)) {
        return parseFloat(unitDict[targetUnit] / unitDict[sourceUnit]);
      }
      else {
        throw new Error('no conversion for either ' + sourceUnit + ' or ' + targetUnit);
      }
    });

    shrike.register('toDegrees', function(x) {
      return shrike.scalarIterator(x, function(a) {
        if (Math.abs(a) <= 1e-10) {
          return 0.0;
        }
        else {
          return (180.0 / Math.PI) * a;
        }
      });
    });

    shrike.register('toRadians', function(x) {
      return shrike.scalarIterator(x, function(a) {
        return (Math.PI / 180.0) * a;
      });
    });

    // incidentally calling this with its default arguments will convert things to a float
    shrike.register('toFloat', shrike.scalarIterator);

    // parses an axis and an angle from some arguments
    // input can be an object with axis and angle properties
    // an array of 3 values for axis and an angle
    // or an array of 4 values, first three being axis and the last one angle
    shrike.register('parseAxisAngle', function(axis, angle) {
      var _axis, _angle;
      var _throwError = function() {
        throw new Error('parse axis and angle input was not something we recognized');
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

      var axislength = shrike.sum(axis.map(shrike.square));
      if (axislength <= 1e-10) {
        return [1.0, 0.0, 0.0, 0.0];
      }
      var halfangle = angle / 2.0;
      var sinangle = Math.sin(halfangle) / Math.sqrt(axislength);
      return [
        Math.cos(halfangle),
        axis[0] * sinangle,
        axis[1] * sinangle,
        axis[2] * sinangle
        ];
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

    shrike.register('matrixFromAxisAngle', shrike.rot);

    // angle is returned in radians
    shrike.register('axisAngleFromQuat', function(quatraw) {

      var quat = shrike.toFloat(quatraw);
      var sinang = shrike.sum(quat.slice(1, 4).map(shrike.square));

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
      return [
      [M[0][0], M[0][1], M[0][2]], [M[1][0], M[1][1], M[1][2]], [M[2][0], M[2][1], M[2][2]]
        ];
    });

    // makes sure that a matrix is a 4x4 transform
    shrike.register('matrix4', function(M) {
      if (M[0].length == 3) {
        M[0].push(0.0);
        M[1].push(0.0);
        M[2].push(0.0);
      }

      if (M.length == 3) {
        M.push([0.0, 0.0, 0.0, 1.0]);
      }

      return M;
    });

    shrike.register('composeTransform', function(rot, trans) {
      return [
      [rot[0][0], rot[0][1], rot[0][2], trans[0]], [rot[1][0], rot[1][1], rot[1][2], trans[1]], [rot[2][0], rot[2][1], rot[2][2], trans[2]], [0.0, 0.0, 0.0, 1.0]
        ];
    });

    shrike.register('decomposeTransform', function(T) {
      var trans = [T[0][3], T[1][3], T[2][3]];

      var rot = [
      T[0].slice(0, 3),
      T[1].slice(0, 3),
      T[2].slice(0, 3)
    ];

      return {
        rotationMatrix: rot,
        translation: trans
      };
    });

    shrike.register('mjsToMujin', function(mjsMatrix) {
      var m = mjsMatrix;
      return [
      [m[0], m[4], m[8], m[12]], [m[1], m[5], m[9], m[13]], [m[2], m[6], m[10], m[14]], [m[3], m[7], m[11], m[15]]
        ];
    });
  }
});
