const cheerio = require('gulp-cheerio');
const env = process.env.CAMEL_ENV || 'development';
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');

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

gulp.task('sitemap', (done) => {
  return gulp.src('public/sitemap.xml')
    .pipe(cheerio(($, f) =>
      $('sitemapindex').append(`<sitemap>
<loc>https://camel.apache.org/sitemap-website.xml</loc>
</sitemap>`)
    ))
    .pipe(gulp.dest('public'));
});
