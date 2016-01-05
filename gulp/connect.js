'use strict';

var gulp = require( 'gulp' );
var connect = require( 'gulp-connect' );
var php = require( 'gulp-connect-php' );
var browserSync = require('browser-sync');


// Start local (Php) dev server.
gulp.task( 'php', function()
{
  php.server( {
                base: global.paths.src,
                port: 8080,
                keepalive: true
              } );
} );

// Start local (Node) dev server.
gulp.task( 'connect-node', function()
{
  connect.server( {
                    root: global.paths.src,
                    livereload: true
                  } );
} );

gulp.task('connect-php',['php'], function() {
  browserSync({
                proxy: '127.0.0.1:8080',
                port: 8080,
                open: true,
                notify: false
              });
});

