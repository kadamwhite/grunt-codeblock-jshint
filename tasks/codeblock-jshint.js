'use strict';

var path = require( 'path' );
var JSHint = require( 'jshint' ).JSHINT;
var defaultReporter = require( 'jshint/src/reporters/default' ).reporter;
var marked = require( 'marked' );

module.exports = function( grunt ) {
  var desc = 'Run JSHint against code snippets within Markdown slides.';

  grunt.registerTask( 'codeblock-jshint', desc, function codeBlockJSHintTask() {
    // Get any configured options, defaulting the search paths to any markdown
    // files below the working directory other than those in node_modules
    var options = this.options({
      src: [
        '**/*.md',
        '!node_modules/**/*.md'
      ]
    });

    var reporter;

    // Attempt to apply a provided reporter
    if ( ! options.reporter ) {
      // If no configuration was supplied, use the default
      reporter = defaultReporter;
    } else if ( typeof options.reporter === 'string' ) {
      // Otherwise, if a string was provided, attempt to load the reporter from
      // a module path string in the manner that grunt-contrib-jshint does
      options.reporter = path.resolve( process.cwd(), options.reporter );
      try {
        reporter = require( options.reporter ).reporter;
      } catch ( err ) {
        grunt.fatal( err );
      }
    } else if ( typeof options.reporter === 'function' ) {
      // Handle cases like `reporter: function myCustomReporter() {}`
      reporter = options.reporter;
    } else {
      // Fall back to the default reporter
      reporter = defaultReporter;
    }

    // Process all slides markdown files and turn into token lists from marked.
    function convertToTokens( file ) {
      var contents = grunt.file.read( file );
      var tokens = marked.lexer( contents );

      return {
        file: file,
        tokens: tokens
      };
    }

    var markdownTokens = grunt.file.expand( options.src ).map( convertToTokens );

    // Utility for filtering out tokens that don't represent code blocks
    function onlyJSTokens( token ) {
      return token.type === 'code' && token.lang === 'javascript';
    }

    // Filter each token list and make list of JSHint files to run on.
    function reduceToJSHintErrors( memo, item ) {

      function evaluateToken( snippet ) {
        var didFail = ! JSHint.jshint( snippet.text );

        if ( didFail && JSHint.errors.length ) {
          // Add each identified error to the output
          JSHint.errors.forEach(function recordError( error ) {
            memo.push({
              file: item.file,
              error: error
            });
          });
        }
      }

      // For each code file, run JSHint and see if it fails.
      item.tokens.filter( onlyJSTokens ).forEach( evaluateToken );

      return memo;
    }

    var results = markdownTokens.reduce( reduceToJSHintErrors, [] );

    // Log results
    reporter( results );

    if ( results.length ) {
      throw new Error( results.length + ' errors' );
    }
  });
};
