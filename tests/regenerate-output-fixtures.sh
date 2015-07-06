#!/bin/bash

# Paths are relative to root of project
node_modules/.bin/grunt codeblock-jshint:passing > tests/fixtures/output/passing.txt
node_modules/.bin/grunt codeblock-jshint:failing > tests/fixtures/output/failing.txt
node_modules/.bin/grunt codeblock-jshint:filtered > tests/fixtures/output/filtered.txt
node_modules/.bin/grunt codeblock-jshint:forced > tests/fixtures/output/forced.txt
node_modules/.bin/grunt codeblock-jshint:with-jshint-options > tests/fixtures/output/with-jshint-options.txt

echo "Done!"
