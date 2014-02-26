module.exports = function(grunt) {

  var WEBSERVER_PORT = 8010;
  var LIVERELOAD_PORT = 12020;

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
      options: {
        livereload: LIVERELOAD_PORT
      },

      test: {
        options: {
          port: WEBSERVER_PORT,
          open: 'http://localhost:' + WEBSERVER_PORT + '/_SpecRunner.html'
        }
      },

      docs: {
        options: {
          port: WEBSERVER_PORT + 1,
          open: 'http://localhost:' + (WEBSERVER_PORT + 1) + '/docs/shrike.html'
        }
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
        tasks: [
          'lint',
          'build',
          'docs',
          'test'
        ]
      }
    },

    preprocess: {
      options: {
        context: {
          BANNER: '<%= meta.banner %>',
          SHRIKE_DO_ASSERT: true
        }
      },
      dev: {
        src: 'src/shrike.js',
        dest: 'shrike.js'
      },
      prod: {
        src: 'src/shrike.js',
        dest: 'shrike.js',
        options: {
          context: {
            SHRIKE_DO_ASSERT: false
          }
        }
      }
    },

    uglify: {
      options: {
        banner: '<%= meta.banner %>'
      },
      prod: {
        mangle: {
          except: ['shrike', 'V3', 'M4']
        },
        src: 'shrike.js',
        dest: 'shrike.min.js'
      }
    },

    docco: {
      debug: {
        src: ['shrike.js'],
        options: {
          output: 'docs/'
        }
      }
    }
  });

  grunt.registerTask('lint', [
    'jsbeautifier',
    'exec:fixjsstyle'
  ]);

  grunt.registerTask('build', ['requirejs']);

  grunt.registerTask('test', ['jasmine:shrike:build']);

  grunt.registerTask('build', [
    'preprocess:prod',
    'uglify',
    'preprocess:dev'
  ]);

  grunt.registerTask('docs', ['docco']);

  grunt.registerTask('default', [
    'lint',
    'build',
    'docs',
    'test',
    'connect',
    'watch'
  ]);
};
