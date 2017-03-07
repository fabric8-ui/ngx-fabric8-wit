
var gulp = require('gulp'),
  sourcemaps = require('gulp-sourcemaps'),
  ngc = require('gulp-ngc'),
  changed = require('gulp-changed');

var appSrc = 'src';
var libraryDist = 'dist';
var watchDist = 'dist-watch';
var globalExcludes = [ '!./**/examples/**', '!./**/examples' ]

/**
 * FUNCTION LIBRARY
 */

function updateWatchDist() {
  return gulp
    .src([libraryDist + '/**'].concat(globalExcludes))
    .pipe(changed(watchDist))
    .pipe(gulp.dest(watchDist));
}

/**
 * TASKS
 */

gulp.task('build-library',
  [
    'transpile',
    'copy-static-assets'
  ]);

gulp.task('transpile', function () {
  return ngc('tsconfig.json')
});

gulp.task('copy-static-assets', function () {
  return gulp.src([
    'LICENSE',
    'README.adoc',
    'package.json',
  ])
    .pipe(gulp.dest(libraryDist));
});

gulp.task('copy-watch', ['post-transpile'], function() {
  return updateWatchDist();
});

gulp.task('copy-watch-all', ['build-library'], function() {
  return updateWatchDist();
});

gulp.task('watch', ['build-library', 'copy-watch-all'], function () {
  gulp.watch([appSrc + '/app/**/*.ts', '!' + appSrc + '/app/**/*.spec.ts'], ['transpile', 'copy-watch']).on('change', function (e) {
    console.log('TypeScript file ' + e.path + ' has been changed. Compiling.');
  });
});
