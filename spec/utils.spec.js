describe('utils', function() {

  var shrike = require('shrike');

  it('isArray', function() {

    expect(shrike.isArray(undefined)).not.toBe(true);
    expect(shrike.isArray(arguments)).not.toBe(true);
    expect(shrike.isArray([0, 1, 2])).toBe(true);

    var a = new Array();
    expect(shrike.isArray(a)).toBe(true);

    var f32a = new Float32Array();
    expect(shrike.isArray(f32a)).toBe(true);
  });
});
