'use strict';

var gulp = require( 'gulp' );
var gutil = require( 'gulp-util' );

var autoprefixer = require( 'gulp-autoprefixer' );
var concat = require( 'gulp-concat' );
var exec = require( 'child_process' ).execSync;
var imagemin = require( 'gulp-imagemin' );
var minifyCss = require( 'gulp-minify-css' );
var minifyHtml = require( 'gulp-minify-html' );
var pngquant = require( 'imagemin-pngquant' );
var rename = require( 'gulp-rename' );
var replace = require( 'gulp-replace' );
var runSeq = require( 'run-sequence' );
var sass = require( 'gulp-sass' );
var uglify = require( 'gulp-uglify' );

var glob = require( 'glob' );
var fileManipulator = require( "./fileManipulator.js");

// One build task to rule them all.
gulp.task( 'build', function( done )
{
  runSeq( 'clean', [ 'buildsass', 'buildimg', 'buildjs' ], ['buildhtml', 'buildphp'], done );
} );

// Build SASS for distribution.
gulp.task( 'buildsass', function()
{
  gulp.src( global.paths.sass )
    .pipe( sass().on( 'error', sass.logError ) )
    .pipe( concat( 'app.css' ) )
    .pipe( autoprefixer() )
    .pipe( minifyCss() )
    .pipe( rename( {
                     suffix: '.min'
                   } ) )
    .pipe( gulp.dest( global.paths.dist ) );
} );

// Build JS for distribution.
gulp.task( 'buildjs', function()
{
  var entrypoints = glob.sync( 'src/js/*.js' );

  entrypoints.forEach( function( path )
                             {
                               var file = fileManipulator.getFilenameFromPath( path );
                               gutil.log( "Building: " + path );
                               exec( 'jspm bundle-sf1x js/' + file + ' dist/' + file + '.min.js --minify --skip-source-maps' );
                             } );
} );

// Build HTML for distribution.
gulp.task( 'buildhtml', function()
{
  var entrypoints = glob.sync( 'src/js/*.js' );
  var files = [];
  entrypoints.forEach( function( path ){
    files.push( fileManipulator.getFilenameFromPath( path));
  });
  /* TODO search for all files in the js root dir and remove the system.import lines
   1. Find all the scripts loaded in with System.import on the page
   2. Replace all the System.import lines with script tags to the minified JS verions
   */
  gulp.src( global.paths.html )
    .pipe( replace( 'css/app.css', 'app.min.css' ) )
    .pipe( replace( 'lib/system.js', 'app.min.js' ) )
    .pipe( replace( '<script src="config.js"></script>', '' ) )
    .pipe( replace( "<script>System.import('./js/app')</script>", '' ) )
    .pipe( minifyHtml() )
    .pipe( gulp.dest( global.paths.dist ) );
} );

// Build PHP for distribution.
gulp.task( 'buildphp', function()
{
  gulp.src( global.paths.php )
    .pipe( replace( 'css/app.css', 'app.min.css' ) )
    .pipe( replace( 'lib/system.js', 'app.min.js' ) )
    .pipe( replace( '<script src="config.js"></script>', '' ) )
    .pipe( replace( "<script>System.import('./js/app')</script>", '' ) )
    .pipe( gulp.dest( global.paths.dist ) );
} );

// Build images for distribution.
gulp.task( 'buildimg', function()
{
  gulp.src( global.paths.img )
    .pipe( imagemin( {
                       progressive: true,
                       svgoPlugins: [ { removeViewBox: false } ],
                       use: [ pngquant() ]
                     } ) )
    .pipe( gulp.dest( global.paths.dist + '/img' ) );
} );


