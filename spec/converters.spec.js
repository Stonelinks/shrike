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
    var arr = new shrike.FLOAT_ARRAY_TYPE([0.0, 1.5, 2.3]);

    // floats
    expect(shrike.toFloat([0.0, 1.5, 2.3])).toEqual(arr);

    // strings
    expect(shrike.toFloat(['0.0', '1.5', '2.3'])).toEqual(arr);

    // mixed int, string, float
    expect(shrike.toFloat([0, '1.5', 2.3])).toEqual(arr);

    // empty
    expect(shrike.toFloat([])).toEqual(new shrike.FLOAT_ARRAY_TYPE([]));

    // one element
    expect(shrike.toFloat(['1.3'])).toEqual(new shrike.FLOAT_ARRAY_TYPE([1.3]));
    expect(shrike.toFloat(['13'])).toEqual(new shrike.FLOAT_ARRAY_TYPE([13]));
    expect(shrike.toFloat([13])).toEqual(new shrike.FLOAT_ARRAY_TYPE([13.0]));

    // 2d
    var arr = [new shrike.FLOAT_ARRAY_TYPE([0.0, 1.5, 2.3]), new shrike.FLOAT_ARRAY_TYPE([1.4, 0, 112.34])];

    // floats
    expect(shrike.toFloat([[0.0, 1.5, 2.3], [1.4, 0, 112.34]])).toEqual(arr);

    // strings
    expect(shrike.toFloat([['0.0', '1.5', '2.3'], ['1.4', '0', '112.34']])).toEqual(arr);

    // mixed int, string, float
    expect(shrike.toFloat([[0, '1.5', 2.3], ['1.4', 0, 112.34]])).toEqual(arr);

    // empty
    expect(shrike.toFloat([[]])).toEqual([new shrike.FLOAT_ARRAY_TYPE([])]);
    expect(shrike.toFloat([[], []])).toEqual([new shrike.FLOAT_ARRAY_TYPE([]), new shrike.FLOAT_ARRAY_TYPE([])]);

    // one element
    expect(shrike.toFloat([['1.3']])).toEqual([new shrike.FLOAT_ARRAY_TYPE([1.3])]);
    expect(shrike.toFloat([['13']])).toEqual([new shrike.FLOAT_ARRAY_TYPE([13])]);
    expect(shrike.toFloat([[13]])).toEqual([new shrike.FLOAT_ARRAY_TYPE([13.0])]);
  });

  it('convert from typed arrays to normal ones', function() {

    // floats
    expect(function() {shrike.toUntypedArray(121.5)}).toThrow();

    // strings
    expect(function() {shrike.toUntypedArray('121.5')}).toThrow();

    // int
    expect(function() {shrike.toUntypedArray('121')}).toThrow();

    // 1d
    var arr = [0.0, 1.5, 2.3];

    // floats
    expect(shrike.toUntypedArray(new shrike.FLOAT_ARRAY_TYPE(arr))).toEqual(arr);

    // strings
    arr = ['0.0', '1.5', '2.3'];
    expect(shrike.toUntypedArray(arr)).toEqual(arr);

    // mixed int, string, float
    arr = [0, '1.5', 2.3];
    expect(shrike.toUntypedArray(arr)).toEqual(arr);

    // empty
    arr = [];
    expect(shrike.toUntypedArray(new shrike.FLOAT_ARRAY_TYPE(arr))).toEqual(arr);

    // one element
    arr = ['1.3'];
    expect(shrike.toUntypedArray(arr)).toEqual(arr);
    arr = [1.3];
    expect(shrike.toUntypedArray(arr)).toEqual(arr);

    // TODO: 2d
    // 2d
    // var arr = [new shrike.FLOAT_ARRAY_TYPE([0.0, 1.5, 2.3]), new shrike.FLOAT_ARRAY_TYPE([1.4, 0, 112.34])];

    // floats
    // expect(shrike.toUntypedArray([[0.0, 1.5, 2.3], [1.4, 0, 112.34]])).toEqual(arr);

    // strings
    // expect(shrike.toUntypedArray([['0.0', '1.5', '2.3'], ['1.4', '0', '112.34']])).toEqual(arr);

    // mixed int, string, float
    // expect(shrike.toUntypedArray([[0, '1.5', 2.3], ['1.4', 0, 112.34]])).toEqual(arr);

    // empty
    // expect(shrike.toUntypedArray([[]])).toEqual([new shrike.FLOAT_ARRAY_TYPE([])]);
    // expect(shrike.toUntypedArray([[], []])).toEqual([new shrike.FLOAT_ARRAY_TYPE([]), new shrike.FLOAT_ARRAY_TYPE([])]);

    // one element
    // expect(shrike.toUntypedArray([['1.3']])).toEqual([new shrike.FLOAT_ARRAY_TYPE([1.3])]);
    // expect(shrike.toUntypedArray([['13']])).toEqual([new shrike.FLOAT_ARRAY_TYPE([13])]);
    // expect(shrike.toUntypedArray([[13]])).toEqual([new shrike.FLOAT_ARRAY_TYPE([13.0])]);
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
      axis: new shrike.FLOAT_ARRAY_TYPE([1, 2, 3]),
      angle: 90
    };

    expect(shrike.axisAngle.$({
      axis: [1, 2, 3],
      angle: 90
    })).toEqual(res);
    expect(shrike.axisAngle.$([1, 2, 3, 90])).toEqual(res);
    expect(shrike.axisAngle.$([1, 2, 3, 90])).toEqual(res);
    expect(shrike.axisAngle.$(['1', '2', '3'], '90')).toEqual(res);

    expect(function() {shrike.axisAngle.$('jkasdkjlsadlkjsdalkj')}).toThrow();
    expect(function() {shrike.axisAngle.$(undefined)}).toThrow();
    expect(function() {shrike.axisAngle.$('-7723fsdfsad100')}).toThrow();
    expect(function() {shrike.axisAngle.$(['i\m a string'])}).toThrow();
    expect(function() {shrike.axisAngle.$([undefined])}).toThrow();
    expect(function() {shrike.axisAngle.$([[undefined]])}).toThrow();
    expect(function() {shrike.axisAngle.$([['boo']])}).toThrow();
    expect(function() {shrike.axisAngle.$([['1.2boom']])}).toThrow();
    expect(function() {shrike.axisAngle.$([[false]])}).toThrow();
    expect(function() {shrike.axisAngle.$([[null]])}).toThrow();
    expect(function() {shrike.axisAngle.$([[function() {}]])}).toThrow();
    expect(function() {shrike.axisAngle.$([[], [], undefined])}).toThrow();
  });

  it('quaternion from axis and angle', function() {
    var res = new shrike.FLOAT_ARRAY_TYPE([0.5253219888177297, 0.22741353271464756, 0.45482706542929513, 0.6822405981439427]);

    expect(shrike.quat.fromAxisAngle({
      axis: new shrike.FLOAT_ARRAY_TYPE([1, 2, 3]),
      angle: 90.0
    })).toEqual(res);
    expect(shrike.quat.fromAxisAngle([1, 2, 3, 90])).toEqual(res);
    expect(shrike.quat.fromAxisAngle([1, 2, 3, 90])).toEqual(res);
    expect(shrike.quat.fromAxisAngle(['1', '2', '3'], '90')).toEqual(res);

    expect(function() {shrike.quat.fromAxisAngle('jkasdkjlsadlkjsdalkj')}).toThrow();
    expect(function() {shrike.quat.fromAxisAngle(undefined)}).toThrow();
    expect(function() {shrike.quat.fromAxisAngle('-7723fsdfsad100')}).toThrow();
    expect(function() {shrike.quat.fromAxisAngle(['i\m a string'])}).toThrow();
    expect(function() {shrike.quat.fromAxisAngle([undefined])}).toThrow();
    expect(function() {shrike.quat.fromAxisAngle([[undefined]])}).toThrow();
    expect(function() {shrike.quat.fromAxisAngle([['boo']])}).toThrow();
    expect(function() {shrike.quat.fromAxisAngle([['1.2boom']])}).toThrow();
    expect(function() {shrike.quat.fromAxisAngle([[false]])}).toThrow();
    expect(function() {shrike.quat.fromAxisAngle([[null]])}).toThrow();
    expect(function() {shrike.quat.fromAxisAngle([[function() {}]])}).toThrow();
    expect(function() {shrike.quat.fromAxisAngle([[], [], undefined])}).toThrow();
  });
});
