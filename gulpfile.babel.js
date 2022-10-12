"use strict";

import gulp from 'gulp';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
import babel from 'gulp-babel';  // support JS for old browsers
import concat from 'gulp-concat'; // 파일을 하나의 파일로 압축해준다.
import uglify from 'gulp-uglify'; // 자바스크립트 코드를 압축해 용량을 줄여준다.
import del from 'del';
import chalk from 'chalk'; // console colorful

const plumber = require('gulp-plumber');
const svgSprite = require('gulp-svg-sprite');

const fractal      = require('./fractal.config');
const logger       = fractal.cli.console;




/**
 * ==============================+
 * @task : Start the Fractal server
 * ==============================+
 */
 gulp.task('fractal:start', function () {
  const server = fractal.web.server({
    sync: true
  });
  server.on('error', err => logger.error(err.message));
  return server.start().then(() => {
    console.log(chalk.green(`┌─────────────────────────────────────────┐`));
    console.log(chalk.green(`| Fractal web UI server is running!       |`));
    console.log(chalk.green(`|-----------------------------------------|`));
    console.log(chalk.green(`| Local URL: ${server.url}        |`));
    console.log(chalk.green(`| Network URL: ${server.urls.sync.external}   |`));
    console.log(chalk.green(`└─────────────────────────────────────────┘`));
  });
});


/**
 * ==============================+
 * @task : Run a static export of the project web UI
 * ==============================+
 */
 gulp.task('fractal:build', function() {
  const builder = fractal.web.builder();
  builder.on('progress', (completed, total) => logger.update(`Exported ${completed} of ${total} items`, 'info'));
  builder.on('error', err => logger.error(err.message));
  return builder.build().then(() => {
    logger.success('Fractal build completed!');
  });
});


/**
 * ==============================+
 * @task : svg-sprite
 * ==============================+
 */
gulp.task('svg:sprite', () => {
  return new Promise( resolve => {
    gulp.src('./src/assets/svg/icon/*.svg')
      .pipe(plumber())
      .pipe(svgSprite({
        mode: {
          inline:true,
          symbol: {
            dest: "svg",
            sprite: "icons",
          },
        },
        svg: {
          xmlDeclaration: false,
          doctypeDeclaration: false,
        }
      }))
      .on('error', error => {
        logger.error(err.message);
      })
      .pipe(gulp.dest('./public'));

    resolve();
  });
});

gulp.task('svg', gulp.series(['svg:sprite']));


/**
 * ==================================+
 * @task : SCSS
 * ==================================+
 */
gulp.task('scss:compile', () => {
  return new Promise( resolve => {
    gulp.src(['./src/assets/scss/*.scss', './src/components/**/*.scss'])
      .pipe(sass({
        outputStyle: 'compressed',
        sourceComments:  false
      }).on('error', sass.logError))
      .pipe(concat('common.css'))
      .pipe(gulp.dest('./public/css'));

    resolve();
  });
});

gulp.task('scss:clean', () => {
  return new Promise( resolve => {
    del(['./public/css']);
    
    resolve();
  });
});

gulp.task('scss', gulp.series('scss:clean', 'scss:compile'));

gulp.task('scss:watch', () => {
  gulp.watch(['./src/assets/scss/*.scss', './src/components/**/*.scss'], gulp.series('scss'));
});


/**
 * ==================================+
 * @task : Script Compile
 * ==================================+
 */
gulp.task('js:compile', () => {
  return new Promise( resolve => {
    gulp.src(['./src/assets/js/*.js', './src/components/**/*.js'])
      .pipe(babel())
      .pipe(uglify())
      .pipe(concat('common.min.js'))
      .pipe(gulp.dest('./public/js'));

    resolve();
  });
});

gulp.task('js:clean', () => {
  return new Promise( resolve => {
    del(['./public/js']);
    
    resolve();
  });
});

gulp.task('js', gulp.series('js:clean', 'js:compile'));

gulp.task('js:watch', () => {
  gulp.watch(['./src/assets/js/*.js', './src/components/**/*.js'], gulp.series('js'));
});



gulp.task('default', gulp.series(['svg', 'scss', 'js']));
gulp.task('watch', gulp.series(['scss:watch', 'js:watch']));
gulp.task('dev', gulp.series('default', 'fractal:start', 'watch'));
gulp.task('build', gulp.series('default', 'fractal:build'));
