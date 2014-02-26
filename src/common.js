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

  // @if SHRIKE_DO_ASSERT
  shrike.assert(shrike.isArray(a), 'can\'t compute sum of non-array ' + a);
  // @endif

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

  // @if SHRIKE_DO_ASSERT
  shrike.assert(shrike.isNumber(x), 'can\'t square non numeric element: ' + x);
  // @endif

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

  // @if SHRIKE_DO_ASSERT
  shrike.assert(shrike.isNumber(dec), 'round: ' + dec + ' is not valid number of decimal places');
  shrike.assert(dec <= 20, 'round: can only round up to 20 decimal places');
  shrike.assert(shrike.isNumber(n), 'round: ' + n + ' is not a numeric type');
  // @endif

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
