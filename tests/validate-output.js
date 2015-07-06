'use strict';

// This file will validate that all of the temp files were correctly created
var fs = require( 'fs' );
var path = require( 'path' );
var chalk = require( 'chalk' );

console.log( 'Validating file output...' );

// Pairs of
var tests = [
  {
    expected: './fixtures/output/failing-filtered.txt',
    actual:  '../temp/failing-filtered.txt'
  },
  {
    expected: './fixtures/output/failing-forced.txt',
    actual:  '../temp/failing-forced.txt'
  },
  {
    expected: './fixtures/output/failing.txt',
    actual:  '../temp/failing.txt'
  },
  {
    expected: './fixtures/output/passing.txt',
    actual:  '../temp/passing.txt'
  }
];

/**
 * Read a file specified by a path relative to this script
 * @param  {String} filePath The path to a file
 * @return {String}          That file's contents
 */
function readFile( filePath ) {
  var pathToLoad = path.join( path.dirname( __filename ), filePath );
  // Asynchronicity? We don't need no stinkin' asynchronicity
  return fs.readFileSync( pathToLoad ).toString();
}

var errors = 0;

tests.forEach(function( test ) {
  if ( readFile( test.expected ) === readFile( test.actual ) ) {
    return;
  }

  // Else, this is a failure
  errors = errors + 1;

  console.error( chalk.red([
    'Error! Unexpected output from task codeblock-jshint:',
    test.actual.replace( /\.\/(.*).txt/, '$1' )
  ].join( ' ' ) ) );
});

if ( errors ) {
  process.exit( 1 );
} else {
  console.log( chalk.green( '\nFiles OK' ) );
  process.exit( 0 );
}
