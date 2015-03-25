module.exports = function( grunt ) {
  'use strict';

  var merge = require( 'lodash.merge' );

  // Reusable JSHintRC options
  var jshintrc = grunt.file.readJSON( '.jshintrc' );

  // Load tasks.
  require( 'load-grunt-tasks' )( grunt );

  grunt.initConfig({

    pkg: grunt.file.readJSON( 'package.json' ),

    jscs: {
      options: {
        config: '.jscsrc',
        reporter: require( 'jscs-stylish' ).path
      },
      grunt: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: 'tasks/**/*.js'
      },
      tests: {
        src: 'tests/**/*.js'
      }
    },

    jshint: {
      options: {
        reporter: require( 'jshint-stylish' )
      },
      grunt: {
        options: jshintrc,
        src: 'Gruntfile.js'
      },
      lib: {
        options: jshintrc,
        src: 'tasks/**/*.js'
      },
      tests: {
        options: merge( jshintrc, {
          globals: {
            describe: false,
            it: false,
            beforeEach: false,
            afterEach: false
          }
        }),
        src: 'tests/**/*.js'
      }
    }

  });

  grunt.registerTask( 'lint', [ 'jshint', 'jscs' ] );
  grunt.registerTask( 'default', [ 'lint' ] );
};
