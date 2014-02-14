module.exports = function(grunt) {

  var WEBSERVER_PORT = 8000;
  var LIVERELOAD_PORT = 12000;

  require('load-grunt-tasks')(grunt, {
    pattern: ['grunt-*', '!grunt-template-jasmine-requirejs']
  });

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    meta: {
      banner: '// <%= pkg.name %> - v<%= pkg.version %>\n' +
        '// <%= pkg.description %>\n' +
        '//\n' +
        '// Copyright (c)<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        '// Distributed under <%= pkg.license %> license\n' +
        '//\n' +
        '// <%= pkg.homepage %>\n' +
        '\n'
    },

    jsbeautifier: {
      options: {
        js: {
          braceStyle: 'end-expand',
          indentSize: 2,
          keepArrayIndentation: true,
          maxPreserveNewlines: 10,
          preserveNewlines: true
        }
      },

      src: {
        src: [
          'src/**/*.js'
        ]
      },

      extras: {
        src: [
          'Gruntfile.js',
          'specs/**/*.js'
        ]
      }
    },

    connect: {
      browserTest: {
        port: WEBSERVER_PORT,
        options: {
          // keepalive: true,
          hostname: '*',
          livereload: LIVERELOAD_PORT,
          open: 'http://localhost:' + WEBSERVER_PORT + '/_SpecRunner.html'
        }
      },

      test: {
        port: WEBSERVER_PORT
      }
    },

    jasmine: {
      shrike: {
        src: 'src/**/*.js',
        options: {
          specs: 'spec/*.spec.js',
          helpers: 'spec/helpers/*.js',
          host: 'http://localhost:' + WEBSERVER_PORT + '/',
          template: require('grunt-template-jasmine-requirejs'),
          templateOptions: {
            requireConfig: {
              deps: ['shrike']
            }
          }
        }
      }
    },

    requirejs: {
      options: {
        optimize: 'none',
        preserveLicenseComments: false,

        findNestedDependencies: true,
        optimizeAllPluginResources: true,

        baseUrl: 'src/',

        include: ['shrike'],
        paths: {
          'mjs': '../bower_components/mjs/mjs',
          'underscore': '../bower_components/underscore/underscore'
        },
        wrap: {
          start: '<%= meta.banner %>'
        }
      },

      dev: {
        options: {
          out: 'shrike.js'
        }
      },

      production: {
        options: {
          optimize: 'uglify2',
          out: 'shrike.min.js'
        }
      }
    },

    exec: {
      fixjsstyle: {
        command: 'fixjsstyle Gruntfile.js && fixjsstyle -r src/ && fixjsstyle -r spec/'
      }
    },

    watch: {

      options: {
        // spawn: true,
        interval: 500,
        forever: true,
        debounceDelay: 1000,
        livereload: LIVERELOAD_PORT
      },

      src: {
        files: [
          'src/**/*.js',
          'spec/**/*.js'
        ],
        tasks: ['lint', 'browserTest']
      }
    }
  });

  grunt.registerTask('lint', [
    'jsbeautifier',
    'exec:fixjsstyle'
  ]);

  grunt.registerTask('build', [
    'requirejs'
  ]);

  grunt.registerTask('test', [
    'build',
    'connect:test',
    'jasmine:shrike'
  ]);

  grunt.registerTask('browserTest', [
    'build',
    'jasmine:shrike:build'
  ]);

  grunt.registerTask('default', [
    'connect:browserTest',
    'browserTest',
    'watch'
  ]);
};
