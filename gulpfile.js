var gulp = require('gulp');
var critical = require('critical').stream;
 
gulp.task('critical', function () {
  return gulp.src('public/**/index.html')
    .pipe(critical({base: 'public/', inline: true}))
    .pipe(gulp.dest('public'));
});
