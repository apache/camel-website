const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const env = process.env.CAMEL_ENV || 'development'

gulp.task('minify', (done) => {
  if (env !== 'production') {
    done();
    return;
  }

  return gulp.src('public/**/*.html')
    .pipe(htmlmin({
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      collapseInlineTagWhitespace: true,
      conservativeCollapse: true,
      useShortDoctype: true
    }))
    .pipe(gulp.dest('public'));
});
