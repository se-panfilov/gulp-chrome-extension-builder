# gulp-chrome-extention-builder
Make chromium extensions (zip and crx) from gulp.

Usage
-------

```javascript
gulp.task('gcp-zip', function () {
    return gulp.src('./test_ext')
        .pipe(gcp({
            zip: true,
            crx: false
        }))
        .pipe(gulp.dest('./'))
})
```

History
------

v0.1.1 - Only zip supported
