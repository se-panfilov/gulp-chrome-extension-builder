var gulp = require('gulp');
var gcp = require('gulp-crx-pkg');

gulp.task('gcp', function () {
    return gulp.src('./test_ext')
        .pipe(gcp());
});

gulp.task('default', function () {
    gulp.start('gcp');
});
