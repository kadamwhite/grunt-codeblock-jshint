#!/bin/bash

# Make our working directory
mkdir temp

# Generate output files
node_modules/.bin/grunt codeblock-jshint:passing > temp/passing.txt
node_modules/.bin/grunt codeblock-jshint:failing > temp/failing.txt
node_modules/.bin/grunt codeblock-jshint:failing-filtered > temp/failing-filtered.txt
node_modules/.bin/grunt codeblock-jshint:failing-forced > temp/failing-forced.txt

# Compare output files to expected output,
# as a crude way to validate the tasks work
node ./tests/validate-output.js

# Clean up temp files
rm temp/passing.txt
rm temp/failing.txt
rm temp/failing-filtered.txt
rm temp/failing-forced.txt

# Clean up working directory
rm -r temp
