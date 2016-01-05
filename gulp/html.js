'use strict';

var gulp = require( 'gulp' );
var connect = require( 'gulp-connect' );
var browserSync = require( 'browser-sync' );
var reload = browserSync.reload;

// HTML livereload.
gulp.task( 'html', function()
{
  if( global.node )
  {
    gulp.src( [ global.paths.html, global.paths.php ] )
      .pipe( connect.reload() );
  }
  else{
    gulp.src( [ global.paths.html, global.paths.php ] );
      reload();
  }
} );
