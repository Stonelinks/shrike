module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt, {
    pattern: ['grunt-*', '!grunt-template-jasmine-requirejs']
  });

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    meta: {
      version: '<%= pkg.version %>',
      banner: '// shrike\n' +
        '// ----------------------------------\n' +
        '// v<%= pkg.version %>\n' +
        '//\n' +
        '// Copyright (c)<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        '// Distributed under MIT license\n' +
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
      test: {
        port: 8000
      }
    },

    jasmine: {
      all: {
        src: 'src/**/*.js',
        options: {
          specs: 'spec/*.spec.js',
          helpers: 'spec/helpers/*.js',
          host: 'http://127.0.0.1:8000/',
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
    'connect',
    'jasmine'
  ]);

  grunt.registerTask('default', [
    'test'
  ]);
};
