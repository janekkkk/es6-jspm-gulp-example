'use strict';

/*
 * gulpfile.js
 * ===========
 * Rather than manage one giant configuration file responsible
 * for creating multiple tasks, each task has been broken out into
 * its own file in the 'gulp' folder. Any files in that directory get
 *  automatically required below.
 *
 * To add a new task, simply add a new task file in that directory.
 */

var gulp = require('gulp');
var requireDir = require('require-dir');

// Choose Node or PHP server.
global.node = true;

// Specify paths & globbing patterns for tasks.
global.paths = {

  // HTML sources.
  'html': './src/*.html',
  // PHP sources.
  'php': './src/*.php',
  // JS sources.
  'js': './src/js/**/*.js',
  'jsDep': './src/js/dep/**/*',
  // SASS sources.
  'sass': './src/scss/**/*.scss',
  // Image sources.
  'img': './src/img/*',
  // Sources folder.
  'src': './src',
  // Compiled CSS folder.
  'css': './src/css',
  // Distribution folder.
  'dist': './dist',
  // Tests folder.
  'test': './test/jasmine'
};

// Require all tasks in the 'gulp' folder.
requireDir('./gulp', { recurse: false });

// Default task; start local server & watch for changes.
if(global.node){
  gulp.task('default', ['connect-node', 'watch']);
}
else{
  gulp.task('default', ['connect-php', 'watch']);
}

