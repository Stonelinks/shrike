describe('converters', function() {

  var shrike = require('shrike');

  it('should convert things into floats', function() {

    // throw if array contains unconvertable things
    // expect(function() {shrike.toFloat(['i\m a string'])}).toThrow();
    // expect(function() {shrike.toFloat([undefined])}).toThrow();
    // expect(function() {shrike.toFloat([[undefined]])}).toThrow();
    // expect(function() {shrike.toFloat([['boo']])}).toThrow();
    // expect(function() {shrike.toFloat([['1.2boom']])}).toThrow();
    // expect(function() {shrike.toFloat([[false]])}).toThrow();
    // expect(function() {shrike.toFloat([[null]])}).toThrow();
    // expect(function() {shrike.toFloat([[function() {}]])}).toThrow();
    // expect(function() {shrike.toFloat([[], [], undefined])}).toThrow();

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
});
