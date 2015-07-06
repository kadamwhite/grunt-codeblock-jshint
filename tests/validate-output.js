// This file will run each grunt task, then validate the output is as expected
'use strict';

var fs = require( 'fs' );
var cp = require( 'child_process' );
var path = require( 'path' );
var chalk = require( 'chalk' );
var rsvp = require( 'rsvp' );

// The names of the codeblock-jshint task targets specified in the Gruntfile
// that we should run and validate against the expected output fixtures
var subTasks = [
  'filtered',
  'forced',
  'failing',
  'passing',
  'with-jshint-options'
];

// Get the full path of the test directory by using this file as a referent
var testDirPath = path.dirname( __filename );

// Specify the path of the grunt binary we will be using to run tasks relative
// to the current working directory
var pathToGruntBinary = 'node_modules/.bin/grunt';

// LOGIC TO CREATE AND REMOVE THE TEMPORARY DIRECTORY
// ============================================================================

// Specify the location of our temporary working directory
var tempDir = path.join( testDirPath, 'temp' );

// Ensure the existence of the temporary directory
if ( ! fs.existsSync( tempDir ) ) {
  console.log( 'Creating working directory...' );
  fs.mkdirSync( tempDir );
}

function cleanupTempDir() {
  console.log( 'Cleaning up temp files...' );

  // Remove each output file
  subTasks.forEach(function removeOutputFile( subTask ) {
    var outputFilePath = getOutputFilePath( subTask );
    if ( fs.existsSync( outputFilePath ) ) {
      fs.unlinkSync( outputFilePath );
    }
  });

  // Remove temp dir
  fs.rmdirSync( tempDir );
}

// GLOBAL ERROR HANDLER
// ============================================================================

function handleError( err ) {
  cleanupTempDir();
  console.error( err );
  process.exit( 1 );
}

// UTILITIES TO HELP GET PATHS FOR VARIOUS FILES
// ============================================================================

function getFixturePath( subTask ) {
  return path.join( testDirPath, './fixtures/output/', subTask + '.txt' );
}

function getOutputFilePath( subTask ) {
  return path.join( tempDir, subTask + '.txt' );
}

// HELPER TO RUN THE GRUNT SUBTASK ITSELF
// ============================================================================

function runTaskCommand( subTask ) {
  return new rsvp.Promise(function( resolve, reject ) {
    var command = cp.spawn( pathToGruntBinary, [
      'codeblock-jshint:' + subTask
    ]);

    var outputSteam = fs.createWriteStream( getOutputFilePath( subTask ) );

    command.stdout.on( 'data', function writeOutput( data ) {
      outputSteam.write( data );
    });

    command.on( 'close', function() {
      outputSteam.end();
      resolve( subTask );
    });
  });
}

// RUN THE TASKS
// ============================================================================

console.log( 'Running all codeblock-jshint tasks...' );

var runAllSubtasks = rsvp.all( subTasks.map( runTaskCommand ) );

// HELPERS TO LOAD THE OUTPUT FILES AND THE FIXTURES
// ============================================================================

function loadFile( getPathMethod, subTask ) {
  return new Promise(function( resolve, reject ) {
    fs.readFile( getPathMethod( subTask ), function( err, contents ) {
      if ( err ) {
        return reject( err );
      }
      resolve( contents.toString() );
    });
  }).catch( handleError );
}

var loadOutputFile = loadFile.bind( null, getOutputFilePath );
var loadFixture = loadFile.bind( null, getFixturePath );

function getExpectedAndActual( subTask ) {
  return loadOutputFile( subTask ).then(function( outputFileContents ) {
    return loadFixture( subTask ).then(function( fixtureContents ) {
      return {
        actual: outputFileContents,
        expected: fixtureContents
      };
    });
  }).catch( handleError );
}

// VALIDATE THE OUTPUT
// ============================================================================

var checkAllSubtasks = runAllSubtasks.then(function checkAllSubtaskOutput() {
  console.log( 'Checking output...' );
  function checkSubtaskOutput( subTask ) {
    return new Promise(function( resolve, reject ) {
      getExpectedAndActual( subTask ).then(function checkResults( results ) {
        if ( results.expected === results.actual ) {
          return resolve( subTask );
        }
        console.error( chalk.red( '\nUnexpected output from task codeblock-jshint:' + subTask ) );
        console.error( '\nGot\n' );
        // console.error( chalk.styles.bgBlack.open
        console.error( chalk.italic( results.actual ) );
        console.error( '\nwhen expecting\n' );
        console.error( chalk.italic( results.expected ) );
        reject( 'codeblock-jshint:' + subTask + ' failed' );
      });
    }).catch( handleError );
  }

  return rsvp.all( subTasks.map( checkSubtaskOutput ) );
});

checkAllSubtasks.then( cleanupTempDir ).then(function exit() {
  console.log( chalk.green( '\nDone!' ) + ' Files OK' );
  process.exit( 0 );
}).catch( handleError );
