var sourcemaps = require('gulp-sourcemaps');
require('source-map-support').install();

require('babel/register');

var gulp = require('gulp');

var cache = require('gulp-cached');
var remember = require('gulp-remember');
var babel = require('gulp-babel');
var plumb = require('gulp-plumber');
var mocha = require('gulp-mocha');

gulp.task('default', ['watch']);


gulp.task('test', ['build'], function() {
  return gulp.src('test/**/*.js')
    .pipe(mocha());
});

gulp.task('build', function() {
  return gulp.src(['src/*.js'])
    .pipe(plumber())
    .pipe(cache('js'))
    .pipe(babel({ sourceMaps: 'inline' }))
    .pipe(remember('js'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('watch', ['build'], function() {
  var jsWatch = gulp.watch(['src/*.js', 'test/**/*.js'], ['test'])
    .on('change', checkRemoved('js'));

 function checkRemoved(name) {
   return function(event) {
     if (event.type == 'deleted' && cache.caches[name][event.path]) {
       delete cache.caches[name][event.path];
       remember.forget(name, event.path);
     }
   };
 }
});

function plumber() {
  return plumb({
    errorHandler: function(err) {
      console.log(err);
      this.emit('end');
    }
  });
}
