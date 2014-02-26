// requires t0, t1 to be distinct
shrike.linearlyInterpolate = function(t0, x0, t1, x1, t) {
  return (x0 * (t1 - t) + x1 * (t - t0)) / (t1 - t0);
};
