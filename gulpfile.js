var gulp = require('gulp');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-csso');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var merge = require('merge-stream');
var watch = require('gulp-watch');
var sourcemaps = require('gulp-sourcemaps');
var livereload = require('gulp-livereload');

var sass1 = ['assets/sass/app.scss'],
  scripts1 = ['node_modules/jquery/dist/jquery.min.js', 'node_modules/d3/build/d3.min.js', 'node_modules/d3-selection-multi/build/d3-selection-multi.min.js' , 'assets/js/app.js'];


gulp.task('sass1', function() {
  var t = sass1.map(function(el) {
    return gulp.src(el)
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('public/css'));
  });
  return merge(t);
});

gulp.task('scripts1', function(){
  return gulp.src(scripts1)
    .pipe(sourcemaps.init())
    .pipe(concat('scripts.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/js'));
});

gulp.task('monitor', function() {
  livereload.listen();
  gulp.watch('assets/sass/**/*.scss',['sass1']);
  gulp.watch('assets/js/**/*.js',['scripts1']);
});

gulp.task('default', [ 'sass1', 'scripts1', 'monitor' ]);
