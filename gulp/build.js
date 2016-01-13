'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');

var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var exec = require('child_process').execSync;
var imagemin = require('gulp-imagemin');
var minifyCss = require('gulp-minify-css');
var minifyHtml = require('gulp-minify-html');
var pngquant = require('imagemin-pngquant');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var runSeq = require('run-sequence');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');

var glob = require('glob');
var intercept = require('gulp-intercept');
var change = require('gulp-change');

var stringManipulator = require('./fileManipulator.js');

// One build task to rule them all.
gulp.task('build', function (done) {
  runSeq('clean', ['buildsass', 'buildimg', 'buildjs'], 'buildhtml', done);
});

// Build SASS for distribution.
gulp.task('buildsass', function () {
  gulp.src(global.paths.sass)
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('app.css'))
    .pipe(autoprefixer())
    .pipe(minifyCss())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(global.paths.dist));
});

// Build JS for distribution.
gulp.task('buildjs', function () {
  var entrypoints = glob.sync('src/js/*.js');

  entrypoints.forEach(function (path) {
    var file = stringManipulator.getFilenameFromPath(path);
    gutil.log('Building: ' + path);
    exec(
      'jspm bundle-sfx ' + __dirname + '/../src/js/' + file + ' ' + __dirname + '/../dist/' + file + '.min.js --minify --skip-source-maps');
  });
});

/*
 Build HTML for distribution.
 Find all the scripts loaded in with System.import on the page
 Replace all the System.import lines with script tags to the minified JS verions */
gulp.task('buildhtml', function () {
  function replaceScripttags(content) {
    var script = stringManipulator.getStringBetweenTwoStrings(content, '<script>System.import( ', ')</script>', 6, 2);
    var line = stringManipulator.getStringBetweenTwoStrings(content, '<!-- build:javascript -->', '<!-- endbuild -->', 0, 1);
    return content.replace(line, '\n' + '<script defer src="dist/' + script + '.min.js"></script');
  }

  gulp.src([global.paths.html, global.paths.php])
    .pipe(replace('css/app.css', 'app.min.css'))
    .pipe(change(replaceScripttags))
    .pipe(replace('<script src="lib/system.js"></script>', ''))
    .pipe(replace('<script src="config.js"></script>', ''))
    .pipe(replace('<!-- build:javascript -->', ''))
    .pipe(replace('<!-- endbuild -->', ''))
    .pipe(minifyHtml())
    .pipe(gulp.dest(global.paths.dist));
});

// Build images for distribution.
gulp.task('buildimg', function () {
  gulp.src(global.paths.img)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()],
    }))
    .pipe(gulp.dest(global.paths.dist + '/img'));
});
