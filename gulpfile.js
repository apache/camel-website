const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');

gulp.task('minify', () => {
  return gulp.src('public/**/*.html')
    .pipe(htmlmin({
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      collapseInlineTagWhitespace: true,
      useShortDoctype: true
    }))
    .pipe(gulp.dest('public'));
});
