var gulp = require('gulp');
var gcp = require('gulp-crx-pkg');

gulp.task('default', function () {
    return gulp.src(['./test_ext'])
        .pipe(gcp());
});