var gulp = require('gulp');
var gcp = require('../index.js');

gulp.task('gcp', function () {
    return gulp.src('./test_ext')
        .pipe(gcp())
        .pipe(gulp.dest('./'))
});

gulp.task('gcp-zip', function () {
    return gulp.src('./test_ext')
        .pipe(gcp({
            zip: true,
            crx: false
        }))
        .pipe(gulp.dest('./'))
});

gulp.task('default', function () {
    gulp.start('gcp');
});

gulp.task('zip', function () {
    gulp.start('gcp-zip');
});


