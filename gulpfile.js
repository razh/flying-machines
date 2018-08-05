'use strict';

const PORT = process.env.PORT || 3000;

const SOURCE_DIR = './src';
const BUILD_DIR = 'dist';

const html = `${SOURCE_DIR}/*.html`;
const css = `${SOURCE_DIR}/css/*.css`;

const babelify = require('babelify');
const brfs = require('brfs');
const browserify = require('browserify');
const browserSync = require('browser-sync').create();
const del = require('del');
const source = require('vinyl-source-stream');
const watchify = require('watchify');

const gulp = require('gulp');
const log = require('gulplog');

function onError(error) {
  log.error(error.message);
  this.emit('end');
}

gulp.task('browser-sync', () => {
  return browserSync.init({
    browser: [],
    port: PORT,
    server: {
      baseDir: `./${BUILD_DIR}`,
    },
  });
});

gulp.task('js', () => {
  const bundler = watchify(
    browserify(`${SOURCE_DIR}/js/index.js`, {
      ...watchify.args,
      debug: true,
    }),
  );

  bundler.transform(babelify).transform(brfs);

  function rebundle() {
    return bundler
      .bundle()
      .on('error', onError)
      .pipe(source('bundle.js'))
      .pipe(gulp.dest(BUILD_DIR))
      .pipe(browserSync.reload({ stream: true }));
  }

  bundler.on('log', log.info).on('update', rebundle);

  return rebundle();
});

gulp.task('html', () => {
  return gulp
    .src(html)
    .pipe(gulp.dest(BUILD_DIR))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('css', () => {
  return gulp
    .src(css)
    .pipe(gulp.dest(BUILD_DIR))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('clean', () => del(BUILD_DIR));

gulp.task('watch', () => {
  gulp.watch(html, gulp.series('html'));
  gulp.watch(css, gulp.series('css'));
});

gulp.task(
  'default',
  gulp.series(
    'clean',
    gulp.parallel('html', 'css', 'js'),
    gulp.parallel('browser-sync', 'watch'),
  ),
);
