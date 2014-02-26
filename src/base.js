// assign base properites to shrike

// borrow all of Math's functions and constants... except round since shrike provides its own round function
_.without(Object.getOwnPropertyNames(Math), 'round').forEach(function(prop) {
  shrike[prop] = Math[prop];
});

// borrow mjs too
Object.getOwnPropertyNames(mjs).forEach(function(prop) {
  shrike[prop] = mjs[prop];
});

// alias M4x4 to M4 since it is shorter to type
shrike.M4 = shrike.M4x4;
