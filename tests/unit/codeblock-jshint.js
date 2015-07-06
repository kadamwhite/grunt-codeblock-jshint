'use strict';

var chai = require( 'chai' );
chai.use( require( 'chai-as-promised' ) );
var expect = chai.expect;
var sinon = require( 'sinon' );

/*jshint -W079 */// Suppress warning about redefiniton of `Promise`
var Promise = require( 'bluebird' );
var grunt = require( 'grunt' );

/**
 * Return a promise that resolves when the codeblock-jshint event is received
 *
 * @param  {Grunt} grunt Grunt
 * @return {Promise}     A promise that will be resolved or rejected based on
 *                       the results of the 'codeblock-jshint' Grunt event
 */
function makeTaskDonePromise( grunt ) {
  return new Promise(function( resolve, reject ) {
    grunt.event.once( 'codeblock-jshint', function( status, results ) {
      // Ternary returns either resolve or reject, conditionally
      ( status === 'error' ? reject : resolve )({
        // Only "error" results in a rejection:
        // "forced" and "success" both resolve the promise
        status: status,
        results: results
      });
    });
  });
}

describe( 'codeblock-jshint.js', function() {
  var codeblockJSHint;

  beforeEach(function() {
    // Get our task creation method
    codeblockJSHint = require( '../../tasks/codeblock-jshint' );
  });

  it( 'registers a codeblock-jshint task', function() {
    codeblockJSHint( grunt );
    // Check that task is registered
    expect( grunt.task.exists( 'codeblock-jshint' ) ).to.be.ok;
  });

  describe( 'codeblock-jshint task', function() {
    var taskDone;

    beforeEach(function() {
      // Start the task queue as empty
      grunt.task.clearQueue();

      // Clear out previously-registered codeblock-jshint task
      // console.log( require('lodash').keys( grunt.tasks ) );
      // grunt.tasks._tasks.length = 0;

      // Register task afresh
      codeblockJSHint( grunt );

      // Turn off all previously-registered event listeners
      grunt.event.removeAllListeners( 'codeblock-jshint' );

      // taskDone will notify us of when the task completes
      taskDone = makeTaskDonePromise( grunt );

      // Stub out grunt log methods
      sinon.stub( grunt.log, 'error' );
      sinon.stub( grunt.log, 'write' );
      sinon.stub( grunt.log, 'writeln' );
    });

    afterEach(function() {
      grunt.log.error.restore();
      grunt.log.write.restore();
      grunt.log.writeln.restore();
    });

    it( 'runs the task with the provided options', function() {

      // Enqueue the 'codeblock-jshint' task
      grunt.task.run( 'codeblock-jshint' );

      // Set task options
      grunt.initConfig({
        'codeblock-jshint': {
          src: [ 'tests/fixtures/input/passing.md' ]
        }
      });

      // Run the task queue
      grunt.task.start();

      // Ensure promise eventually is resolved
      var completion = taskDone.then(function( result ) {
        expect( result ).to.have.property( 'status' );
        expect( result.status ).to.equal( 'success' );

        expect( result ).to.have.property( 'results' );
        expect( result.results ).to.have.property( 'length' );
        expect( result.results.length ).to.equal( 0 );

        // Provide a message indicating test is over
        return 'done';
      });

      // Ensure taskDone is resolved
      return expect( completion ).to.eventually.become( 'done' );
    });

    it( 'fails when identifying syntax errors in JavaScript code blocks', function() {

      // Enqueue the 'codeblock-jshint' task
      grunt.task.run( 'codeblock-jshint' );

      // Set task options
      grunt.initConfig({
        'codeblock-jshint': {
          src: [ 'tests/fixtures/input/failing.md' ]
        }
      });

      // Run the task queue
      grunt.task.start();

      // Verify that task fails
      return expect( taskDone ).to.be.rejected;
    });

    it( 'passes even if errors are present when --force is specified', function() {

      // Enqueue the 'codeblock-jshint' task
      grunt.task.run( 'codeblock-jshint' );

      // Set task options
      grunt.initConfig({
        'codeblock-jshint': {
          options: {
            force: true
          },
          src: [ 'tests/fixtures/input/failing.md' ]
        }
      });

      // Run the task queue
      grunt.task.start();

      return expect( taskDone ).to.be.fulfilled;
    });

    it( 'correctly identifies syntax errors in JavaScript code blocks', function() {

      // Enqueue the 'codeblock-jshint' task
      grunt.task.run( 'codeblock-jshint' );

      // Set task options
      grunt.initConfig({
        'codeblock-jshint': {
          src: [ 'tests/fixtures/input/failing.md' ]
        }
      });

      // Run the task queue
      grunt.task.start();

      var completion = taskDone.catch(function( result ) {
        expect( result ).to.have.property( 'status' );
        expect( result.status ).to.equal( 'error' );

        expect( result ).to.have.property( 'results' );
        expect( result.results ).to.have.property( 'length' );
        expect( result.results.length ).to.equal( 2 );

        // Provide a message indicating test is over
        return 'failed';
      });

      // Ensure taskDone is resolved
      return expect( completion ).to.eventually.become( 'failed' );
    });

  });

});
