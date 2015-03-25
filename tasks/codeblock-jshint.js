'use strict';

var JSHint = require( 'jshint' ).JSHINT;
var tokenizeMarkdown = require( 'tokenize-markdown' );
var contribJSHint = require( './lib/jshint' );

module.exports = function( grunt ) {
  var desc = 'Run JSHint against code snippets within Markdown slides.';

  grunt.registerMultiTask( 'codeblock-jshint', desc, function codeBlockJSHintTask() {
    var done = this.async();

    // Get any configured options, defaulting the search paths to any markdown
    // files below the working directory other than those in node_modules
    var options = this.options({
      lang: /(js|javascript)/,
      force: false
    });

    // If force is true, report JSHint errors but dont fail the task
    var force = options.force;
    delete options.force;

    // Use logic borrowed from grunt-contrib-jshint to select the reporter to use
    var reporter = contribJSHint.init( grunt ).selectReporter( options );

    // Process all slides markdown files and turn into token lists from marked,
    // filtering the returned tokens down to only JS files
    var markdownTokens = tokenizeMarkdown.fromFiles( this.filesSrc, {
      type: 'code',
      lang: options.lang
    });

    /**
     * Reducer function to run JSHint against each file's tokens and aggregate any errors
     *
     * @param  {Array}  errors Reducer memo array, collecting any JSHint errors
     * @param  {Object} item   The item defining the tokens for a given file
     * @return {Array}         An array of aggregated JSHint errors
     */
    var results = markdownTokens.reduce(function reduceToJSHintErrors( errors, file ) {

      // For each code file, run JSHint and see if it fails.
      file.tokens.forEach(function evaluateToken( snippet ) {
        var didFail = ! JSHint.jshint( snippet.text );

        if ( didFail && JSHint.errors.length ) {
          // Add each identified error to the output
          JSHint.errors.forEach(function recordError( error ) {
            errors.push({
              // File path
              file: file.file,
              // JSHint error object
              error: error
            });
          });
        }
      });

      return errors;
    }, [] );

    // Log results
    reporter( results );

    // If no errors occurred, we're green
    var noErrors = ! results.length;

    // Fail task if errors were logged, unless force is set
    var passed = noErrors || force;

    var eventType;

    if ( noErrors ) {
      eventType = 'success';
    } else {
      eventType = force ? 'forced' : 'error';
    }

    // Emit an event (used exclusively for testing)
    grunt.event.emit( 'codeblock-jshint', eventType, results );

    // End the task
    done( passed );
  });
};
