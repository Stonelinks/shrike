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
