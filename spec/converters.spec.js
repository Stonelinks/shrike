describe('converters', function() {

  var shrike = require('shrike');

  it('should convert things into floats', function() {

    // throw if array contains unconvertable things
    expect(function() {shrike.toFloat(['i\m a string'])}).toThrow();
    expect(function() {shrike.toFloat([undefined])}).toThrow();
    expect(function() {shrike.toFloat([[undefined]])}).toThrow();
    expect(function() {shrike.toFloat([['boo']])}).toThrow();
    expect(function() {shrike.toFloat([['1.2boom']])}).toThrow();
    expect(function() {shrike.toFloat([[false]])}).toThrow();
    expect(function() {shrike.toFloat([[null]])}).toThrow();
    expect(function() {shrike.toFloat([[function() {}]])}).toThrow();

    var arr = [0.0, 1.5, 2.3];

    // floats
    expect(shrike.toFloat([0.0, 1.5, 2.3])).toEqual(arr);

    // strings
    expect(shrike.toFloat(['0.0', '1.5', '2.3'])).toEqual(arr);

    // mixed int, string, float
    expect(shrike.toFloat([0, '1.5', 2.3])).toEqual(arr);
  });
});
