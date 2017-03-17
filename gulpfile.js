var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');

gulp.task('script', function() {
  gulp.src(['./src/lib/eventEmitter.js', './src/lib/drag.js', './src/clipper.js'])
    .pipe(concat('clipper.js'))
    .pipe(gulp.dest('./dist/'))
});

gulp.task('css', function() {
  gulp.src(['./src/css/clipper.css'])
    .pipe(concat('clipper.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest('./dist/'))
});

gulp.task( 'build', [ 'script', 'css'] );