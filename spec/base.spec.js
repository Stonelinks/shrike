describe('base', function() {

  var shrike = require('shrike');

  it('sum', function() {

    // throw on undefined or anything not a 1'd array
    expect(function() {shrike.sum(undefined)}).toThrow();
    expect(function() {shrike.sum(false)}).toThrow();
    expect(function() {shrike.sum(1)}).toThrow();
    expect(function() {shrike.sum('lol wtf')}).toThrow();
    expect(function() {shrike.sum([[1, 2, 3], [1, 2, 4]])}).toThrow();

    // bad crap in the array
    expect(function() {shrike.sum([0, 'lol hey dude', 2.3])}).toThrow();
    expect(function() {shrike.sum([0, undefined, 2.3])}).toThrow();

    // ints
    expect(shrike.sum([0, 1, 2])).toBe(3);

    // floats
    expect(shrike.sum([0.0, 1.5, 2.3])).toBe(3.8);

    // strings
    expect(shrike.sum(['0.0', '1.5', '2.3'])).toBe(3.8);

    // mixed int, string, float
    expect(shrike.sum([0, '1.5', 2.3])).toBe(3.8);
  });
});
