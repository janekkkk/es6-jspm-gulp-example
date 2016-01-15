'use strict';

var gulp = require('gulp');
var jasmine = require('jasmine');

// Unit test with Jasmine.
gulp.task('test', function () {
  return gulp.src(global.paths.tests)
    // gulp-jasmine works on filepaths so you can't have any plugins before it
    .pipe(jasmine());
});
