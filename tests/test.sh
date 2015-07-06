#!/bin/bash

# Make our working directory
mkdir temp

# Generate output files
node_modules/.bin/grunt codeblock-jshint:failing > temp/failing.txt
node_modules/.bin/grunt codeblock-jshint:filtered > temp/filtered.txt
node_modules/.bin/grunt codeblock-jshint:forced > temp/forced.txt
node_modules/.bin/grunt codeblock-jshint:passing > temp/passing.txt
node_modules/.bin/grunt codeblock-jshint:with-jshint-options > temp/with-jshint-options.txt

# Compare output files to expected output,
# as a crude way to validate the tasks work
node ./tests/validate-output.js

# Clean up temp files
rm temp/failing.txt
rm temp/filtered.txt
rm temp/forced.txt
rm temp/passing.txt
rm temp/with-jshint-options.txt

# Clean up working directory
rm -r temp
