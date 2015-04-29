'use strict';

const PORT = process.env.PORT || 3000;

const SOURCE_DIR = './src';
const BUILD_DIR = 'dist';

const _ = require('lodash');
const babelify = require('babelify');
const browserify = require('browserify');
const browserSync = require('browser-sync').create();
const del = require('del');
const runSequence = require('run-sequence');
const source = require('vinyl-source-stream');
const watchify = require('watchify');

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

function onError(error) {
  $.util.log(error.message);
  this.emit('end');
}

gulp.task('browser-sync', function() {
  return browserSync.init({
    browser: [],
    port: PORT,
    server: {
      baseDir: './' + BUILD_DIR
    }
  });
});

gulp.task('js', function() {
  const bundler = watchify(browserify(SOURCE_DIR + '/js/index.js',
    _.assign({
      debug: true
    }, watchify.args)));

  bundler.transform(babelify);

  function rebundle() {
    return bundler.bundle()
      .on('error', onError)
      .pipe(source('bundle.js'))
      .pipe(gulp.dest(BUILD_DIR))
      .pipe(browserSync.reload({stream: true}));
  }

  bundler
    .on('log', $.util.log)
    .on('update', rebundle);

  return rebundle();
});

gulp.task('html', function() {
  return gulp.src(SOURCE_DIR + '/*.html')
    .pipe(gulp.dest(BUILD_DIR))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', function() {
  gulp.watch([SOURCE_DIR + '/*.html'], ['html']);
});

gulp.task('clean', del.bind(null, [BUILD_DIR]));

gulp.task('default', ['clean'], function(cb) {
  return runSequence(
    ['html', 'js'],
    ['browser-sync', 'watch'],
    cb
  );
});
