// shrike utility functions, mostly for registering and detecting types

window.pass = window.pass || function() {};

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

// safe version of isArray
shrike.isArray = function(thing) {
  if (_.isArray(thing)) {
    return true;
  }

  return shrike.isNativeFloatArray(thing);
};

// checks for special array types
shrike.isNativeFloatArray = function(thing) {
  try {
    return (_.isArray(thing) !== true) && Object.prototype.toString.call(thing).slice(-'Array]'.length) == 'Array]';
  }
  catch (e) {
    return false;
  }
};

shrike.is2DArray = function(thing) {
  if (!shrike.isArray(thing)) {
    return false;
  }

  if (shrike.isNativeFloatArray(thing)) {
    return false;
  }

  if (thing.length === 0) {
    return false;
  }

  return _.every(_.map(thing, shrike.isArray));
};

shrike.isNumber = function(thing) {
  return !isNaN(parseFloat(thing)) && isFinite(thing) && !shrike.isArray(thing);
};

// for pretty printing a matrix
// TODO: maybe delete this? it is old and never really used
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
