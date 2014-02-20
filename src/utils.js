// shrike utility functions, mostly for registering and detecting types
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

    // set a (sometimes nested) property on the shrike object, warn if it conflicts
    shrike.register = function(k, v) {

      // keys can be compound
      var keys = k.split('.').reverse();
      if (keys.length == 1) {
        shrike.assert(!shrike.hasOwnProperty(k), 'shrike already has a ' + k);
        shrike[k] = v;
      }
      else {
        var lastKey = keys[0];
        var prop = shrike;
        while (keys.length > 0) {

          var thisKey = keys.pop();

          shrike.assert(!(prop.hasOwnProperty(thisKey) && !_.isObject(prop[thisKey])), 'shrike already has a ' + k);

          if (thisKey === lastKey) {
            prop[thisKey] = v;
          }
          else {

            if (!_.isObject(prop[thisKey])) {
              prop[thisKey] = {};
            }

            prop = prop[thisKey];
          }
        }
      }
    };

    // TODO: make it so you can alias things with depth >1
    shrike.alias = function(newName, orig) {
      shrike.assert(shrike.hasOwnProperty(orig), 'shrike doesn\'t have a ' + orig + ' to alias');
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
    });
    window.pp = shrike.prettyPrint;
  }
});
