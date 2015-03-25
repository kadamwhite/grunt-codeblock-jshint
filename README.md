# grunt-codeblock-jshint

Run JSHint against code snippets within Markdown slides

[![Build Status](https://travis-ci.org/kadamwhite/grunt-codeblock-jshint.svg)](https://travis-ci.org/kadamwhite/grunt-codeblock-jshint)

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-codeblock-jshint --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks( 'grunt-codeblock-jshint' );
```

## The "codeblock_jshint" task

### Overview
In your project's Gruntfile, add a section named `'codeblock-jshint'` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  'codeblock-jshint': {
    options: {
      // Task-specific options go here
    },
    your_target: {
      // Target-specific file lists and/or options go here
    }
  },
});
```

### Options

#### options.reporter
Type: `String|Function`

The path to a custom JSHint reporter, or else a custom reporter function
to use when logging the output from JSHint

### Usage Examples

#### Default Options
In this example, the default reporter is used, and all markdown files within
the provided directory are scanned for code blocks to lint.

```js
grunt.initConfig({
  'codeblock-jshint': {
    options: {},
    src: './path/to/some/markdown/files/**/*.md'
  }
});
```

#### Multiple Targets
In this example, two different directories of markdown files are scanned, and
results from one of them are logged with a custom JSHint reporter

```js
grunt.initConfig({
  'codeblock-jshint': {
    slides: {
      src: [
        'path/to/slides/**/*.md',
        'other/slide/particular-slide.md'
      ]
    },
    notes: {
      options: {
        reporter: require( 'jshint-stylish' )
      },
      src: 'path/to/notes/**/*.md'
    }
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
