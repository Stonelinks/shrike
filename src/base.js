// Borrow all of window.Math's functions and constants... except round since shrike provides its own round function.
_.without(Object.getOwnPropertyNames(Math), 'round').forEach(function(prop) {
  shrike[prop] = Math[prop];
});

// Borrow mjs too.
Object.getOwnPropertyNames(mjs).forEach(function(prop) {
  shrike[prop] = mjs[prop];
});

// Alias M4x4 to M4 for convenience.
shrike.M4 = shrike.M4x4;
