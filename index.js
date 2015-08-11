'use strict';

var fs = require("fs");
var ChromeExtension = require("crx");
var join = require("path").join;
var through = require('through2');
var gutil = require('gulp-util');
var merge = require('merge');
var PluginError = gutil.PluginError;

module.exports = function (opt) {

    function showError(e) {
        console.error(new PluginError('gulp-crx-pkg', e));
    }

    function transform(file, enc, cb) {
        if (file.isStream()) return cb(new PluginError('gulp-crx-pkg', 'Streaming not supported'));

        var options = merge({
            zip: false,
            crx: true
        }, opt);

        var crx = new ChromeExtension(options);
        crx.load(file.path).then(function () {
            return crx.loadContents();
        }, showError).then(function (archiveBuffer) {

            if (options.zip) {
                var f = new gutil.File({
                    cwd: file.cwd,
                    base: file.base,
                    path: join(file.base, 'demo.zip'),
                    contents: archiveBuffer
                });
            }

            cb(null, f);
            if (options.crx) {
                return crx.pack(archiveBuffer).then(function (crxBuffer) {

                    var f = new gutil.File({
                        cwd: file.cwd,
                        base: file.base,
                        path: join(file.base, 'demo.crx'),
                        contents: crxBuffer
                    });

                    return cb(null, f);
                }, showError);
            }
        });

    }

    return through.obj(transform);
};