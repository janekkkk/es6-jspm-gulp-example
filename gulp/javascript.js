'use strict';

var gulp = require( 'gulp' );
var connect = require( 'gulp-connect' );
var browserSync = require( 'browser-sync' );
var reload = browserSync.reload;

// JavaScript livereload.
gulp.task( 'js', function()
{
  if( global.node )
  {
    gulp.src( global.paths.js )
      .pipe( connect.reload() );
  }
  else{
    gulp.src( global.paths.js );
      reload();
  }
} );
