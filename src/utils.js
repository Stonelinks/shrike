define([

  'underscore'

], function(_) {
  'use strict';

  window.pass = window.pass || function() {};

  return function(shrike) {

    shrike.throwError = function(msg) {
      msg = msg || 'undefined error';
      throw new Error('SHRIKE: ' + msg);
    };

    // set a property on the shrike object, warn if it conflicts
    shrike.register = function(k, v) {
      if (shrike.hasOwnProperty(k)) {
        shrike.throwError('shrike already has a ' + k);
      }
      else {
        shrike[k] = v;
      }
    };

    shrike.alias = function(newName, orig) {
      if (!shrike.hasOwnProperty(orig)) {
        shrike.throwError('shrike doesn\'t have a ' + orig + ' to alias');
      }
      shrike.register(newName, shrike[orig]);
    };

    // safe version of isArray
    shrike.register('isArray', function(thing) {
      if (_.isArray(thing)) {
        return true;
      }

      return shrike.isNativeFloatArray(thing);
    });

    // checks special array types
    shrike.register('isNativeFloatArray', function(thing) {
      try {
        return (_.isArray(thing) !== true) && Object.prototype.toString.call(thing).slice(-'Array]'.length) == 'Array]';
      }
      catch (e) {
        return false;
      }
    });

    shrike.register('is2DArray', function(thing) {
      if (!shrike.isArray(thing)) {
        return false;
      }

      if (shrike.isNativeFloatArray(thing)) {
        return false;
      }

      if (thing.length === 0) {
        return false;
      }

      return _.some(thing.map(shrike.isArray));
    });

    shrike.register('isNumber', function(thing) {
      return !isNaN(parseFloat(thing)) && isFinite(thing) && !shrike.isArray(thing);
    });

    // for pretty printing a matrix
    // TODO: maybe delete this? it is old and never really used
    shrike.register('prettyPrint', function(x) {

      console.log(function() {
        if (_.isArray(x)) {

          // not a 2d matrix
          if (!_.isArray(x[0])) {
            // prettyPrint([x]);
            var ret = '[ ' + x.join(', ') + ' ]';
            return ret;
          }
          else {

            // find out what the widest number will be
            var precision = 6;
            var widest = 0;
            for (var i = 0; i < x.length; i++) {
              for (var j = 0; j < x[i].length; j++) {
                if (typeof(x[i][j]) == 'string') {
                  throw new Error('WARNING: there is a string in this matrix, you should fix that');
                }

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
    });
  }
});
