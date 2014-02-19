// functions to augment mjs's 4x4 matrix
define([

  'underscore',
  'mjs'

], function(_, mjs) {
  'use strict';

  return function(shrike) {

    shrike.register('M4.matrixFromQuat', function(quatRaw) {
      var quat = shrike.toFloat(quatRaw);
      var r = shrike.M4.clone(shrike.M4.I);

      var length2 = shrike.sum(quat.map(square));
      if (length2 <= 1e-8) {

        // invalid quaternion, so return identity
        return r;
      }
      var ilength2 = 2.0 / length2;

      var qq1 = ilength2 * quat[1] * quat[1];
      var qq2 = ilength2 * quat[2] * quat[2];
      var qq3 = ilength2 * quat[3] * quat[3];

      r[0] = 1.0 - qq2 - qq3;
      r[1] = ilength2 * (quat[1] * quat[2] - quat[0] * quat[3]);
      r[2] = ilength2 * (quat[1] * quat[3] + quat[0] * quat[2]);
      // r[3] = 0.0
      r[4] = ilength2 * (quat[1] * quat[2] + quat[0] * quat[3]);
      r[5] = 1.0 - qq1 - qq3;
      r[6] = ilength2 * (quat[2] * quat[3] - quat[0] * quat[1]);
      // r[7] = 0.0
      r[8] = ilength2 * (quat[1] * quat[3] - quat[0] * quat[2]);
      r[9] = ilength2 * (quat[2] * quat[3] + quat[0] * quat[1]);
      r[10] = 1.0 - qq1 - qq2;
      // r[11] = 0.0
      // r[12] = 0.0
      // r[13] = 0.0
      // r[14] = 0.0
      // r[15] = 1.0

      return r;
    });

    shrike.register('M4.quatFromMatrix', function(_m) {

      var m = shrike.toFloat(_m);

      var m11 = m[0];
      var m21 = m[1];
      var m31 = m[2];
      var m41 = m[3];
      var m12 = m[4];
      var m22 = m[5];
      var m32 = m[6];
      var m42 = m[7];
      var m13 = m[8];
      var m23 = m[9];
      var m33 = m[10];
      var m43 = m[11];

      var tr = m11 + m22 + m33;
      var r = [0.0, 0.0, 0.0, 0.0];
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

      if (trans.length !== 3) {
        shrike.throwError('M4.composeFromQuatTrans: trans.length !== 3');
      }

      r[12] = trans[0];
      r[13] = trans[1];
      r[14] = trans[2];

      return r;
    });
  }
});
