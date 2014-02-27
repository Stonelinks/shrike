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
