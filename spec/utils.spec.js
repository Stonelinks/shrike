describe('utils', function() {

  var shrike = require('shrike');

  it('detect numbers', function() {

    describe('integer literals', function() {

      // negative integer string
      expect(shrike.isNumber('-10')).toBe(true);

      // zero string
      expect(shrike.isNumber('0')).toBe(true);

      // positive integer string
      expect(shrike.isNumber('5')).toBe(true);

      // negative integer number
      expect(shrike.isNumber(-16)).toBe(true);

      // zero integer number
      expect(shrike.isNumber(0)).toBe(true);

      // positive integer number
      expect(shrike.isNumber(32)).toBe(true);

      // octal integer literal string
      expect(shrike.isNumber('040')).toBe(true);

      // octal integer literal
      expect(shrike.isNumber(0144)).toBe(true);

      // hexadecimal integer literal string
      expect(shrike.isNumber('0xFF')).toBe(true);

      // hexadecimal integer literal
      expect(shrike.isNumber(0xFFF)).toBe(true);
    });

    describe('foating-point literals', function() {

      // negative floating point string
      expect(shrike.isNumber('-1.6')).toBe(true);

      // positive floating point string
      expect(shrike.isNumber('4.536')).toBe(true);

      // negative floating point number
      expect(shrike.isNumber(-2.6)).toBe(true);

      // positive floating point number
      expect(shrike.isNumber(3.1415)).toBe(true);

      // exponential notation
      expect(shrike.isNumber(8e5)).toBe(true);

      // exponential notation string
      expect(shrike.isNumber('123e-2')).toBe(true);
    });

    describe('non-numeric values', function() {

      // empty string
      expect(shrike.isNumber('')).not.toBe(true);

      // whitespace characters string
      expect(shrike.isNumber('        ')).not.toBe(true);

      // tab characters string
      expect(shrike.isNumber('\t\t')).not.toBe(true);

      // alphanumeric character string
      expect(shrike.isNumber('abcdefghijklm1234567890')).not.toBe(true);

      // non-numeric character string
      expect(shrike.isNumber('xabcdefx')).not.toBe(true);

      // boolean true literal
      expect(shrike.isNumber(true)).not.toBe(true);

      // boolean false literal
      expect(shrike.isNumber(false)).not.toBe(true);

      // number with preceding non-numeric characters
      expect(shrike.isNumber('bcfed5.2')).not.toBe(true);

      // number with trailling non-numeric characters
      expect(shrike.isNumber('7.2acdgs')).not.toBe(true);

      // undefined value
      expect(shrike.isNumber(undefined)).not.toBe(true);

      // null value
      expect(shrike.isNumber(null)).not.toBe(true);

      // NaN value
      expect(shrike.isNumber(NaN)).not.toBe(true);

      // infinity primitive
      expect(shrike.isNumber(Infinity)).not.toBe(true);

      // positive Infinity
      expect(shrike.isNumber(Number.POSITIVE_INFINITY)).not.toBe(true);

      // negative Infinity
      expect(shrike.isNumber(Number.NEGATIVE_INFINITY)).not.toBe(true);

      // date object
      expect(shrike.isNumber(new Date(2009, 1, 1))).not.toBe(true);

      // empty object
      expect(shrike.isNumber(new Object())).not.toBe(true);

      // instance of a function
      expect(shrike.isNumber(function() {})).not.toBe(true);

      // arrays
      expect(shrike.isNumber([])).not.toBe(true);
      expect(shrike.isNumber([13])).not.toBe(true);
      expect(shrike.isNumber([[]])).not.toBe(true);
    });
  });

  it('detect arrays', function() {

    // strings, ints, floats, etc are not arrays
    // TODO make this as good as the isNumber stuff
    expect(shrike.isArray(undefined)).not.toBe(true);
    expect(shrike.isArray(false)).not.toBe(true);
    expect(shrike.isArray('0')).not.toBe(true);
    expect(shrike.isArray(0)).not.toBe(true);
    expect(shrike.isArray(1.775)).not.toBe(true);

    // arguments isn't an array!
    expect(shrike.isArray(arguments)).not.toBe(true);

    // but this is
    expect(shrike.isArray([0, 1, 2])).toBe(true);

    // make sure weird array types work
    var f32a = new Float32Array([100.55]);
    expect(shrike.isArray(f32a)).toBe(true);
  });

  it('detect native 1d float arrays', function() {

    // strings, ints, floats, etc are not arrays
    // TODO make this as good as the isNumber stuff
    expect(shrike.isNativeFloatArray(undefined)).not.toBe(true);
    expect(shrike.isNativeFloatArray(false)).not.toBe(true);
    expect(shrike.isNativeFloatArray('0')).not.toBe(true);
    expect(shrike.isNativeFloatArray(0)).not.toBe(true);
    expect(shrike.isNativeFloatArray(1.775)).not.toBe(true);

    // arguments isn't an array!
    expect(shrike.isNativeFloatArray(arguments)).not.toBe(true);

    // this isn't a native 1d flaot array
    expect(shrike.isNativeFloatArray([0, 1, 2])).not.toBe(true);

    // but this is
    var f32a = new Float32Array([100.55]);
    expect(shrike.isNativeFloatArray(f32a)).toBe(true);
  });

  it('detect 2d arrays', function() {

    // strings, ints, floats, etc are not 2d arrays
    // TODO make this as good as the isNumber stuff
    expect(shrike.is2DArray(undefined)).not.toBe(true);
    expect(shrike.is2DArray(false)).not.toBe(true);
    expect(shrike.is2DArray('0')).not.toBe(true);
    expect(shrike.is2DArray(0)).not.toBe(true);
    expect(shrike.is2DArray(1.775)).not.toBe(true);

    // 1d stuff
    expect(shrike.is2DArray([])).not.toBe(true);
    expect(shrike.is2DArray(['pow'])).not.toBe(true);
    expect(shrike.is2DArray([1.23])).not.toBe(true);
    expect(shrike.is2DArray([1, 2, 3, 4])).not.toBe(true);
    expect(shrike.is2DArray([1, 2.4, 3, 4])).not.toBe(true);

    // simple
    expect(shrike.is2DArray([[0, 1, 2]])).toBe(true);

    // undefined in array
    expect(shrike.is2DArray([[undefined]])).toBe(true);
    expect(shrike.is2DArray([[undefined, undefined], [undefined, undefined]])).toBe(true);

    // jagged
    expect(shrike.is2DArray([[1], [1, 2], [1, 2, 3, 4]])).toBe(true);

    // mixed stuff
    expect(shrike.is2DArray([[1], [1, 2], [1], undefined])).not.toBe(true);
    expect(shrike.is2DArray([[1], [1, 2], [1], false])).not.toBe(true);
    expect(shrike.is2DArray([[1], [1, 2], [1], true])).not.toBe(true);
    expect(shrike.is2DArray([[1], [1, 2], [1], 'pow'])).not.toBe(true);

    // empty
    expect(shrike.is2DArray([[]])).toBe(true);
    expect(shrike.is2DArray([[], []])).toBe(true);

    // one value
    expect(shrike.is2DArray([[1.2]])).toBe(true);
    expect(shrike.is2DArray([[1.2], [1.2]])).toBe(true);

    // make sure nested weird array types work
    var f32a = new Float32Array([100.55]);
    expect(shrike.is2DArray(f32a)).not.toBe(true);
    expect(shrike.is2DArray([f32a])).toBe(true);

    // throw out 3d arrays
    // TODO
    // expect(shrike.is2DArray([[['boo']]])).not.toBe(true);
    // expect(shrike.is2DArray([[[], ['hi there']], [[], []]])).not.toBe(true);
  });
});
