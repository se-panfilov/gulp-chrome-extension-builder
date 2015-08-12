'use strict';

var fs = require("fs");
var ChromeExtension = require("crx");
var path = require("path");
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

        //var crx = new ChromeExtension(options);
        var crx = new ChromeExtension({
            codebase: "http://localhost:8000/myFirstExtension.crx"//,
            //privateKey: fs.readFileSync(join(__dirname, "key.pem"))
        });

        crx.load(file.path).then(function () {
            return crx.loadContents();
        }, showError).then(function (archiveBuffer) {
            fs.writeFile(path.join(file.path, 'extension.zip'), archiveBuffer);
            return crx.pack(archiveBuffer);
        }, showError).then(function (crxBuffer) {
            fs.writeFile(path.join(file.path, 'extension.crx'), crxBuffer);
        }, showError);

        //crx.load(file.path).then(function () {
        //    return crx.loadContents();
        //}, showError).then(function (archiveBuffer) {
        //
        //    var name = path.basename(file.path);
        //    var f;
        //
        //    //if (options.zip) {
        //        f = new gutil.File({
        //            cwd: file.cwd,
        //            base: file.base,
        //            path: path.join(file.base, name + '.zip'),
        //            contents: archiveBuffer
        //        });
        //
        //       // cb(null, f);
        //    //}
        //
        //    //if (options.crx) {
        //        return crx.pack(archiveBuffer).then(function (crxBuffer) {
        //            f = new gutil.File({
        //                cwd: file.cwd,
        //                base: file.base,
        //                path: path.join(file.base, name + '.crx'),
        //                contents: crxBuffer
        //            });
        //
        //            return cb(null, f);
        //        }, showError);
        //    //}
        //});

    }

    return through.obj(transform);
};