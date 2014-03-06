Shrike
======

A fast and easy to use vector and matrix library for JavaScript, based heavily off [mjs](https://github.com/Stonelinks/mjs).

Shrike extends off [mjs](https://github.com/Stonelinks/mjs) and adds some additional functionality to the V3 and M4 classes, as well as provide utilities for converting between quaternions and other array / axis / angle based representations.

##How to use it

Shrike is (for now) used as an AMD module that depends on [mjs](https://github.com/Stonelinks/mjs) and [underscore](http://underscorejs.org/) (check bower.json for exact version numbers), so make sure those are loadable by your module loader. Use `shrike.js` for an unoptimized build that includes comments and asserts, or `shrike.min.js` for an optimized / minified version with no comments or asserts. I tend to just alias `shrike` to `math` because it can be used interchangeably with the native `Math` object.

##Docs

In lieu of formal documentation, the source code has been hevily annotated so you can easily figure out what is going on. All functions, their parameters and what they return are in there.

###[Annotated source code](http://stonelinks.github.io/shrike/docs/shrike.html)

##Developing

Assuming you've already run `npm i && bower i` like a good boy, pretty much just run `grunt` and leave it running. I've got plugins configured to do the following:

- Make the normal and minified builds (using [preprocess](https://github.com/jsoverson/preprocess) and [uglify](https://github.com/mishoo/UglifyJS2))
- Build and runs tests (using [jasmine](https://github.com/pivotal/jasmine))
- Generate the html for the annotated source code (using [docco](https://github.com/jashkenas/docco))
- Redo all this stuff if any source files change (using [grunt watch](https://github.com/gruntjs/grunt-contrib-watch))

##The name

Comes from one of my favorite supernatural monsters in Dan Simmons' Hyperion Cantos.
![shrike](http://watchingoutloud.com/wp-content/uploads/2012/09/The-Shrike.jpeg)

#TODO
Write more tests!

