describe('converters', function() {

  var shrike = require('shrike');

  it('convert things into floats', function() {

    // throw if array contains unconvertable things
    expect(function() {shrike.toFloat(['i\m a string'])}).toThrow();
    expect(function() {shrike.toFloat([undefined])}).toThrow();
    expect(function() {shrike.toFloat([[undefined]])}).toThrow();
    expect(function() {shrike.toFloat([['boo']])}).toThrow();
    expect(function() {shrike.toFloat([['1.2boom']])}).toThrow();
    expect(function() {shrike.toFloat([[false]])}).toThrow();
    expect(function() {shrike.toFloat([[null]])}).toThrow();
    expect(function() {shrike.toFloat([[function() {}]])}).toThrow();
    expect(function() {shrike.toFloat([[], [], undefined])}).toThrow();

    // 0d
    var num = 121.5;

    // floats
    expect(shrike.toFloat(121.5)).toEqual(num);

    // strings
    expect(shrike.toFloat('121.5')).toEqual(num);

    // int
    expect(shrike.toFloat('121')).toEqual(121.0);

    // 1d
    var arr = [0.0, 1.5, 2.3];

    // floats
    expect(shrike.toFloat([0.0, 1.5, 2.3])).toEqual(arr);

    // strings
    expect(shrike.toFloat(['0.0', '1.5', '2.3'])).toEqual(arr);

    // mixed int, string, float
    expect(shrike.toFloat([0, '1.5', 2.3])).toEqual(arr);

    // empty
    expect(shrike.toFloat([])).toEqual([]);

    // one element
    expect(shrike.toFloat(['1.3'])).toEqual([1.3]);
    expect(shrike.toFloat(['13'])).toEqual([13]);
    expect(shrike.toFloat([13])).toEqual([13.0]);

    // 2d
    var arr = [[0.0, 1.5, 2.3], [1.4, 0, 112.34]];

    // floats
    expect(shrike.toFloat([[0.0, 1.5, 2.3], [1.4, 0, 112.34]])).toEqual(arr);

    // strings
    expect(shrike.toFloat([['0.0', '1.5', '2.3'], ['1.4', '0', '112.34']])).toEqual(arr);

    // mixed int, string, float
    expect(shrike.toFloat([[0, '1.5', 2.3], ['1.4', 0, 112.34]])).toEqual(arr);

    // empty
    expect(shrike.toFloat([[]])).toEqual([[]]);
    expect(shrike.toFloat([[], []])).toEqual([[], []]);

    // one element
    expect(shrike.toFloat([['1.3']])).toEqual([[1.3]]);
    expect(shrike.toFloat([['13']])).toEqual([[13]]);
    expect(shrike.toFloat([[13]])).toEqual([[13.0]]);
  });

  it('conversion scales for linear units', function() {
    expect(shrike.unitConversionScale('mm', 'm') * 1000).toEqual(1);
    expect(shrike.unitConversionScale('cm', 'm') * 100).toEqual(1);
    expect(shrike.round(shrike.unitConversionScale('in', 'cm'), 2)).toEqual(2.54);
    expect(function() {shrike.unitConversionScale('jkasdkjlsadlkjsdalkj', 'm') * 100}).toThrow();
  });

  it('to degrees', function() {
    expect(shrike.toDegrees(shrike.PI / 2)).toEqual(90);
    expect(shrike.toDegrees(shrike.PI / 4)).toEqual(45);
    expect(shrike.toDegrees(shrike.PI)).toEqual(180);
    expect(shrike.toDegrees(2 * shrike.PI)).toEqual(360);
    expect(shrike.toDegrees('6.283185307179586')).toEqual(360);
    expect(function() {shrike.toDegrees('jkasdkjlsadlkjsdalkj')}).toThrow();
    expect(function() {shrike.toDegrees(undefined)}).toThrow();
    expect(function() {shrike.toDegrees('-7723fsdfsad100')}).toThrow();
  });

  it('to radians', function() {
    expect(shrike.toRadians(90)).toEqual(shrike.PI / 2);
    expect(shrike.toRadians(45)).toEqual(shrike.PI / 4);
    expect(shrike.toRadians(180)).toEqual(shrike.PI);
    expect(shrike.toRadians(360)).toEqual(2 * shrike.PI);
    expect(shrike.toRadians('360')).toEqual(6.283185307179586);
    expect(function() {shrike.toRadians('jkasdkjlsadlkjsdalkj')}).toThrow();
    expect(function() {shrike.toRadians(undefined)}).toThrow();
    expect(function() {shrike.toRadians('-7723fsdfsad100')}).toThrow();
  });

  it('parse axis and angles', function() {
    var res = {
      axis: [1, 2, 3],
      angle: 90
    };

    expect(shrike.parseAxisAngle({
      axis: [1, 2, 3],
      angle: 90
    })).toEqual(res);
    expect(shrike.parseAxisAngle([1, 2, 3, 90])).toEqual(res);
    expect(shrike.parseAxisAngle([1, 2, 3, 90])).toEqual(res);
    expect(shrike.parseAxisAngle(['1', '2', '3'], '90')).toEqual(res);

    expect(function() {shrike.parseAxisAngle('jkasdkjlsadlkjsdalkj')}).toThrow();
    expect(function() {shrike.parseAxisAngle(undefined)}).toThrow();
    expect(function() {shrike.parseAxisAngle('-7723fsdfsad100')}).toThrow();
    expect(function() {shrike.parseAxisAngle(['i\m a string'])}).toThrow();
    expect(function() {shrike.parseAxisAngle([undefined])}).toThrow();
    expect(function() {shrike.parseAxisAngle([[undefined]])}).toThrow();
    expect(function() {shrike.parseAxisAngle([['boo']])}).toThrow();
    expect(function() {shrike.parseAxisAngle([['1.2boom']])}).toThrow();
    expect(function() {shrike.parseAxisAngle([[false]])}).toThrow();
    expect(function() {shrike.parseAxisAngle([[null]])}).toThrow();
    expect(function() {shrike.parseAxisAngle([[function() {}]])}).toThrow();
    expect(function() {shrike.parseAxisAngle([[], [], undefined])}).toThrow();
  });

  it('quaternion from axis and angle', function() {
    var res = [0.5253219888177297, 0.22741353271464756, 0.45482706542929513, 0.6822405981439427];

    expect(shrike.quatFromAxisAngle({
      axis: [1, 2, 3],
      angle: 90
    })).toEqual(res);
    expect(shrike.quatFromAxisAngle([1, 2, 3, 90])).toEqual(res);
    expect(shrike.quatFromAxisAngle([1, 2, 3, 90])).toEqual(res);
    expect(shrike.quatFromAxisAngle(['1', '2', '3'], '90')).toEqual(res);

    expect(function() {shrike.quatFromAxisAngle('jkasdkjlsadlkjsdalkj')}).toThrow();
    expect(function() {shrike.quatFromAxisAngle(undefined)}).toThrow();
    expect(function() {shrike.quatFromAxisAngle('-7723fsdfsad100')}).toThrow();
    expect(function() {shrike.quatFromAxisAngle(['i\m a string'])}).toThrow();
    expect(function() {shrike.quatFromAxisAngle([undefined])}).toThrow();
    expect(function() {shrike.quatFromAxisAngle([[undefined]])}).toThrow();
    expect(function() {shrike.quatFromAxisAngle([['boo']])}).toThrow();
    expect(function() {shrike.quatFromAxisAngle([['1.2boom']])}).toThrow();
    expect(function() {shrike.quatFromAxisAngle([[false]])}).toThrow();
    expect(function() {shrike.quatFromAxisAngle([[null]])}).toThrow();
    expect(function() {shrike.quatFromAxisAngle([[function() {}]])}).toThrow();
    expect(function() {shrike.quatFromAxisAngle([[], [], undefined])}).toThrow();
  });
});
