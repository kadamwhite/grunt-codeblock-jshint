// Copied from grunt-contrib-jshint/tasks/lib/jshint
// TODO: If this ever gets extracted from grunt-contrib-jshint, refactor this!
// ============================================================================
/*
 * grunt-contrib-jshint
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

var path = require( 'path' );

exports.init = function( grunt ) {
  var exports = {};

  var pad = function( msg, length ) {
    while ( msg.length < length ) {
      msg = ' ' + msg;
    }
    return msg;
  };

  // Select a reporter (if not using the default Grunt reporter)
  // Copied from jshint/src/cli/cli.js until that part is exposed
  exports.selectReporter = function( options ) {
    switch ( true ) {
    // JSLint reporter
    case options.reporter === 'jslint':
    case options[ 'jslint-reporter' ]:
      options.reporter = 'jshint/src/reporters/jslint_xml.js';
      break;

    // CheckStyle (XML) reporter
    case options.reporter === 'checkstyle':
    case options[ 'checkstyle-reporter' ]:
      options.reporter = 'jshint/src/reporters/checkstyle.js';
      break;

    // Reporter that displays additional JSHint data
    case options[ 'show-non-errors' ]:
      options.reporter = 'jshint/src/reporters/non_error.js';
      break;

    // Custom reporter
    case options.reporter !== undefined:
      options.reporter = path.resolve( process.cwd(), options.reporter );
    }

    var reporter;
    if ( options.reporter ) {
      try {
        reporter = require( options.reporter ).reporter;
        exports.usingGruntReporter = false;
      } catch ( err ) {
        grunt.fatal( err );
      }
    }

    // Use the default Grunt reporter if none are found
    if ( ! reporter ) {
      reporter = exports.reporter;
    }

    return reporter;
  };

  // Default Grunt JSHint reporter
  exports.reporter = function( results, data ) {
    if ( results.length === 0 ) {
      // Success!
      grunt.verbose.ok();
      return;
    }

    grunt.log.writeln();

    var lastfile = null;
    // Iterate over all errors.
    results.forEach(function processResult( result ) {

      // Only print file name once per error
      if ( result.file !== lastfile ) {
        grunt.log.writeln( ( result.file ? '   ' + result.file : '' ).bold );
      }
      lastfile = result.file;

      var e = result.error;

      // Sometimes there's no error object.
      if ( ! e ) { return; }

      if ( e.evidence ) {
        // Manually increment errorcount since we're not using grunt.log.error().
        grunt.fail.errorcount++;

        // No idea why JSHint treats tabs as indent # characters wide, but it
        // does. See issue: https://github.com/jshint/jshint/issues/430
        // Replacing tabs with appropriate spaces (i.e. columns) ensures that
        // caret will line up correctly.
        var indent = 4;
        var evidence = e.evidence.replace( /\t/g, grunt.util.repeat( indent, ' ' ) );

        grunt.log.writeln( ( pad( e.line.toString(), 7 ) + ' |' ) + evidence.grey );
        grunt.log.write([
          grunt.util.repeat( 9, ' ' ),
          grunt.util.repeat( e.character - 1, ' ' ),
          '^ '
        ].join( '' ) );
        grunt.verbose.write( '[ ' + e.code + ' ] ' );
        grunt.log.writeln( e.reason );

      } else {
        // Generic "Whoops, too many errors" error.
        grunt.log.error( e.reason );
      }
    });
    grunt.log.writeln();
  };

  return exports;
};
