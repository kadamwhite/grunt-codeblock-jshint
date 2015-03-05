'use strict';

var JSHint = require( 'jshint' ).JSHINT;
var defaultReporter = require( 'jshint/src/reporters/default' ).defaultReporter;
var marked = require( 'marked' );

module.exports = function( grunt ) {
  var desc = 'Run JSHint against code snippets within Markdown slides.';

  grunt.registerTask( 'codeblock-jshint', desc, function codeBlockJSHintTask() {
    // Get any configured options:
    // Default search paths to all markdown files below the working directory
    var options = this.options({
      files: './**/*.md',
      reporter: defaultReporter
    });

    // Process all slides markdown files and turn into token lists from marked.
    function convertToTokens( file ) {
      var contents = grunt.file.read( file );
      var tokens = marked.lexer( contents );

      return {
        file: file,
        tokens: tokens
      };
    }

    var markdownTokens = grunt.file.expand( options.files ).map( convertToTokens );

    // Filter each token list and make list of JSHint files to run on.
    function reduceToJSHintErrors( memo, item ) {
      // For each code file, run JSHint and see if it fails.
      item.tokens.filter(function filterJSTokens( token ) {
        return token.type === 'code' && token.lang === 'javascript';
      }).forEach(function checkIfTokenFailsJSHint( snippet ) {
        var didFail = ! JSHint.jshint( snippet.text );

        if ( didFail && JSHint.errors.length ) {
          memo.push({
            file: item.file,
            error: JSHint.errors[ 0 ]
          });
        }
      });

      return memo;
    }

    var results = markdownTokens.reduce( reduceToJSHintErrors, []);

    reporter( results );

    if ( results.length ) {
      throw new Error( 'JSHint hit too many errors' );
    }
  });
};
