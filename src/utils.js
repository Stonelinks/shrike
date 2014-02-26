//
// ##Constant: SHRIKE_FLOAT_ARRAY_TYPE
//
// The base float array type, borrowed it from mjs.
//

var SHRIKE_FLOAT_ARRAY_TYPE = mjs.FLOAT_ARRAY_TYPE;

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

  return shrike.isFloatArray(a);
};

//
// ##Function: shrike.isFloatArray
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

shrike.isFloatArray = function(a) {
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

  if (shrike.isFloatArray(a)) {
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

//
// ##Function: shrike.prettyPrint
//
// Pretty printing a matrix. TODO: maybe delete this? it is old and never really used.
//
// **Parameters:**
//
//   - **x** - whatever it is you're trying to print.
//
// **Returns:**
//
// nothing
//

shrike.prettyPrint = function(x) {

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
};
window.pp = shrike.prettyPrint;
