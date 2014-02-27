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

  // @if SHRIKE_DO_ASSERT
  shrike.assert(_.isObject(o), 'not an object');
  // @endif

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

  // @if SHRIKE_DO_ASSERT
  shrike.assert(shrike.isArray(_v), 'not an array');
  // @endif

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
