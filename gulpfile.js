var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');

gulp.task('script', function() {
  gulp.src(['./src/lib/eventEmitter.js', './src/lib/drag.js', './src/clipper.js'])
    .pipe(concat('clipper.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('css', function() {
  gulp.src(['./src/css/clipper.css'])
    .pipe(concat('clipper.css'))
    .pipe(gulp.dest('./dist/'))
    .pipe(cleanCSS())
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./dist/'))
});

gulp.task( 'build', [ 'script', 'css'] );

gulp.task('watch', function () {
  gulp.watch(['./src/lib/eventEmitter.js', './src/lib/drag.js', './src/clipper.js'], ['script']);
  gulp.watch(['./src/css/clipper.css'], ['css']);
});