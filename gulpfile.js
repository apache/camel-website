const gulp = require('gulp');
const critical = require('critical').stream;
const htmlmin = require('gulp-htmlmin');

gulp.task('critical', () => {
  return gulp.src('public/**/index.html')
    .pipe(critical({base: 'public/', inline: true}))
    .pipe(gulp.dest('public'));
});

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
