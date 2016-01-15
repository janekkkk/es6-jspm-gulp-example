'use strict';

var gulp = require('gulp');
var jasmine = require('gulp-jasmine');

// Unit test with Jasmine.
gulp.task('test', function () {
  return gulp.src(global.paths.test)
    // gulp-jasmine works on filepaths so you can't have any plugins before it.
    .pipe(jasmine());
});

// TODO Continues test not working
// Continuesly unit test with Jasmine.
gulp.task('test:watch', ['test'], function () {
  gulp.watch(global.paths.test, ['test']);
});
