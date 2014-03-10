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
