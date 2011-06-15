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

  (function() {
    var ARGV = readArgs(),
      exit = 0,
      files = ARGV.files,
      options = ARGV.options;

    if (!files.length) {
      files = [ '/dev/stdin' ];
    }

    files.forEach(function(fileName) {
      /*jslint stupid: true */

      var input = FS.readFileSync(fileName, 'utf8');

      if (!JSLINT(input, options)) {
        (function() {
          print("ERRORS in " + fileName + ":");
          JSLINT.errors.forEach(function(e) {
            if (e) {
              print('Lint at line ' + e.line + ' character ' + e.character + ': ' + e.reason);
              print((e.evidence || '').replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1"));
              print('');
            }
          });
          print("\n\n");
          exit = 2;
        }());
      }
      else {
        if (options.verbose) {
          print("SUCCESS! No problems found in " + fileName + "\n\n");
        }
      }
    });

    quit(exit);
  }());
}());

