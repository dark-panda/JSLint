// node.js
/*
Copyright (c) 2013 J Smith <dark.panda@gmail.com> Node Edition
*/

/*global JSLINT */
/*jslint node: true */

(function () {
  'use strict';

  /*properties stdout, write, exit, argv, readFileSync, verbose, undef */

  var FS = require('fs'),
    DEFAULT_OPTIONS = {
      'bitwise': true,
      'newcap': true,
      'nomen': true,
      'plusplus': true,
      'regexp': true,
      'browser': true,
      'undef': true,
      'white': true,
      'devel': true,
      'verbose': false
    };

  function print(msg) {
    process.stdout.write(msg + "\n");
  }

  function quit(code) {
    process.exit(code);
  }

  function readArgs() {
    /*properties files, options */

    var retval = {
      'files': [],
      'options': DEFAULT_OPTIONS
    };

    process.argv.slice(2).forEach(function(arg) {
      if (arg.match(/^--([a-z]+)(?:=(.+))?/)) {
        (function() {
          /*properties $1, $2 */

          var option = RegExp.$1,
            value = RegExp.$2;

          switch (value) {
            case 'true':
            case '':
              retval.options[option] = true;
            break;

            case 'false':
              retval.options[option] = false;
            break;

            default:
              retval.options[option] = value;
          }
        }());
      }
      else {
        retval.files.push(arg);
      }
    });

    return retval;
  }

  function StdoutPrinter() {
    this.output = [];
  }

  StdoutPrinter.prototype.addErrors = function(fileName, errors) {
    var that = this;

    this.output.push("ERRORS in " + fileName + ":");
    errors.forEach(function(e) {
      if (e) {
        that.output.push('Lint at line ' + e.line + ' character ' + e.character + ': ' + e.reason);
        that.output.push((e.evidence || '').replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1"));
        that.output.push('');
      }
    });
    this.output.push("\n\n");
  };

  StdoutPrinter.prototype.addSuccess = function(fileName) {
    this.output.push("SUCCESS! No problems found in " + fileName + "\n\n");
  };

  StdoutPrinter.prototype.print = function() {
    print(this.output.join("\n"));
  };

  function JSONPrinter() {
    this.output = [];
  };

  JSONPrinter.prototype.addErrors = function(fileName, errors) {
    this.output.push({
      "filename": fileName,
      "errors": errors
    });
  };

  JSONPrinter.prototype.addSuccess = function(fileName) {
    // no-op
    return;
  };

  JSONPrinter.prototype.print = function() {
    print(JSON.stringify(this.output));
  };

  (function() {
    var ARGV = readArgs(),
      exit = 0,
      files = ARGV.files,
      options = ARGV.options,
      printer;

    if (!files.length) {
      files = [ '/dev/stdin' ];
    }

    if (options.json) {
      printer = new JSONPrinter();
    }
    else {
      printer = new StdoutPrinter();
    }

    files.forEach(function(fileName) {
      /*jslint stupid: true */

      var input = FS.readFileSync(fileName, 'utf8');

      if (!JSLINT(input, options)) {
        printer.addErrors(fileName, JSLINT.errors);
        exit = 2;
      }
      else {
        if (options.verbose) {
          printer.addSuccess(fileName);
        }
      }
    });

    printer.print();

    quit(exit);
  }());
}());
