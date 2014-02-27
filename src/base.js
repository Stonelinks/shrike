// Borrow all of window.Math's functions and constants... except round since shrike provides its own round function.
_.without(Object.getOwnPropertyNames(Math), 'round').forEach(function(prop) {
  shrike[prop] = Math[prop];
});

// Borrow mjs too.
Object.getOwnPropertyNames(mjs).forEach(function(prop) {
  shrike[prop] = mjs[prop];
});

// Alias M4x4 to M4 for convenience.
shrike.M4 = shrike.M4x4;

//
// ##Constant: FLOAT_ARRAY_TYPE
//
// The base float array type, borrowed it from mjs.
//
var FLOAT_ARRAY_TYPE = shrike.FLOAT_ARRAY_TYPE = mjs.FLOAT_ARRAY_TYPE;

shrike.throwError = function(msg) {
  msg = msg || 'undefined error';
  throw new Error('SHRIKE: ' + msg);
};

// @if SHRIKE_DO_ASSERT
shrike.assert = function(cond, msg) {
  if (!cond) {
    shrike.throwError(msg);
  }
};
// @endif

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

            // @if SHRIKE_DO_ASSERT
            shrike.assert(!_.isString(x[i][j]), 'prettyPrint: there is a string in this matrix, you should fix that');
            // @endif

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
