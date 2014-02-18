describe('common', function() {

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

    // empty sums should be 0
    expect(shrike.sum([])).toBe(0);
  });

  it('round', function() {

    // throw on garbage input
    expect(function() {shrike.round(undefined)}).toThrow();
    expect(function() {shrike.round(false)}).toThrow();
    expect(function() {shrike.round('lol wtf')}).toThrow();
    expect(function() {shrike.round([[1, 2, 3], [1, 2, 4]])}).toThrow();
    expect(function() {shrike.round(['i\m a string'])}).toThrow();
    expect(function() {shrike.round([undefined])}).toThrow();
    expect(function() {shrike.round([[undefined]])}).toThrow();

    // ints
    expect(shrike.round(1111)).toEqual(1111);
    expect(shrike.round(1111, 2)).toEqual(1111);

    // more than 20 places
    expect(function() {shrike.round(1111, 21)}).toThrow();

    // floats
    expect(shrike.round(1.5235, 3)).toBe(1.524);
    expect(shrike.round(1.5235, 2)).toBe(1.52);
    expect(shrike.round(1.5235, 1)).toBe(1.5);
    expect(shrike.round(1.5235, 0)).toBe(2);
    expect(shrike.round(1.50000000001, 4)).toBe(1.5);

    // strings
    expect(shrike.round('1.5235', 3)).toBe(1.524);
    expect(shrike.round('1.5235', 2)).toBe(1.52);
    expect(shrike.round('1.5235', 1)).toBe(1.5);
    expect(shrike.round('1.5235', 0)).toBe(2);
    expect(shrike.round('1.50000000001', 4)).toBe(1.5);
  });
});
