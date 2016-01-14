'use strict';

var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var connect = require('gulp-connect');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var gulpif = require('gulp-if');

var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};

// TODO Add Ruby Sass support https://github.com/sindresorhus/gulp-ruby-sass

// Compile SASS with sourcemaps + livereload.
gulp.task('sass', function () {

  gulp.src(global.paths.sass)
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(concat('app.css'))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('.'))
    .pipe(gulpif(global.node, connect.reload()))
    .pipe(gulp.dest(global.paths.css));
  if (!global.node) {
    reload();
  }

});
