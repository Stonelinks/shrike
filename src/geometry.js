shrike.geom = {};

shrike.geom.canvasToViewport = function(canvasX, canvasY, canvasWidth, canvasHeight, viewportAspectRatio) {
  var viewportX = ((canvasX / canvasWidth) - 0.5) * viewportAspectRatio;
  var viewportY = 0.5 - (canvasY / canvasHeight);
  return [viewportX, viewportY];
};

shrike.geom.getProjectionScale = function(depth, fovDegrees) {
  return 2.0 * depth * math.tan(0.5 * math.toRadians(fovDegrees));
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
