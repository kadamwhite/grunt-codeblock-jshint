'use strict';

var JSHint = require( 'jshint' ).JSHINT;
var tokenizeMarkdown = require( 'tokenize-markdown' );
var contribJSHint = require( './lib/jshint' );
var grunt = require( 'grunt' );

/**
 * Use Grunt to load a file from the file system
 *
 * @param  {String} fileName The file name to load
 * @return {Object}          An object representing the file and its contents
 */
function readfile( fileName ) {
  // Read the file and return an object with the file's name & contents
  return {
    name: fileName,
    contents: grunt.file.read( fileName )
  };
}

/**
 * Take in an object with a file's name & contents, and return an object
 * containing the tokenized and filtered markdown tokens
 *
 * (options object is specified first because it will be bound as the first
 * argument within the .map() function chain in the task definition)
 *
 * @param {Object} options             An options object for filtering tokens
 * @param {String|RegExp} options.lang RegEx or String specifying language(s)
 *                                     that should be included in results
 * @param {Object} fileObj             An object describing a file
 * @param {String} fileObj.name        The path (filename) of the file
 * @param {String} fileObj.contents    The contents of the file, as a string
 * @return {Object} An object { file: 'fileName', tokens: tokenObjectArray }
 */
function tokenizeFile( options, fileObj ) {
  // Convert to tokens using the specified language filter parameters
  var tokens = tokenizeMarkdown.fromString( fileObj.contents, {
    type: 'code',
    lang: options.lang
  });

  // Map results into an object defining the tokens for this file
  return {
    file: fileObj.name,
    tokens: tokens
  };
}

/**
 * Reducer function to run JSHint against each file's tokens and aggregate any errors
 *
 * @param  {Array}  errors Reducer memo array, collecting any JSHint errors
 * @param  {Object} item   The item defining the tokens for a given file
 * @return {Array}         An array of aggregated JSHint errors
 */
function reduceToJSHintErrors( errors, file ) {

  // For each code file, run JSHint and see if it fails.
  file.tokens.forEach(function evaluateToken( snippet ) {
    var didFail = ! JSHint.jshint( snippet.text );

    if ( didFail && JSHint.errors.length ) {
      // Add each identified error to the output
      JSHint.errors.forEach(function recordError( error ) {
        errors.push({
          // File path
          file: file.name,
          // JSHint error object
          error: error
        });
      });
    }
  });

  return errors;
}

// Export the task definition
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

    // Expand the fileSrc glob to a file names list
    var results = grunt.file.expand( this.filesSrc )
      // Load each file into memory
      .map( readfile )
      // Convert each file to Markdown tokens
      .map( tokenizeFile.bind( null, options ) )
      // Process each files' tokens with JSHint and return a unified error list
      .reduce( reduceToJSHintErrors, [] );

    // Log results
    reporter( results );

    // If no errors occurred, we're green
    var noErrors = ! results.length;

    var eventType;

    if ( noErrors ) {
      eventType = 'success';
    } else {
      eventType = force ? 'forced' : 'error';
    }

    // Emit an event (used exclusively for testing)
    grunt.event.emit( 'codeblock-jshint', eventType, results );

    // End the task: Fail if errors were logged, unless force was set
    done( noErrors || force );
  });
};
