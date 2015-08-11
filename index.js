'use strict';

var fs = require("fs");
var ChromeExtension = require("crx");
var join = require("path").join;
var through = require('through2');
var gutil = require('gulp-util');
var merge = require('merge');
var PluginError = gutil.PluginError;
var streamBuffers = require("stream-buffers");

module.exports = function (opt) {

    //var REQUIRED_PROPERTIES = ['manifest_version', 'name', 'version'];

    function showError(e) {
        (new PluginError('gulp-crx-pkg', e));
    }

    function transform(file, enc, cb) {
        //if (!file) return cb(new PluginError('gulp-crx-pkg', 'Files required'));
        if (file.isStream()) return cb(new PluginError('gulp-crx-pkg', 'Streaming not supported'));

        var options = merge({
            zip: false
        }, opt);


        //var extensionData = {};
        //extensionData.codebase = options.codebase;
        //extensionData.zip = extensionData.zip || false;
        //var key = null;
        //
        //if (options.privateKey) {
        //    key = {};
        //    key.dirname = options.privateKey.dirname;
        //    key.name = options.privateKey.name;
        //    privateKey.privateKey = fs.readFileSync(join(key.dirname, key.name));
        //}

        var crx = new ChromeExtension(options);

        crx.load(file.path).then(function () {
            return crx.loadContents();
        }, showError).then(function (archiveBuffer) {
            //fs.writeFile(file.path + '.zip', archiveBuffer);

            var f = new gutil.File({
                cwd: file.cwd,
                base: file.base,
                path: join(file.base, 'demo.zip'),
                contents: archiveBuffer
            });

            return cb(null, f);
            //return crx.pack(archiveBuffer);
            //}, showError).then(function (crxBuffer) {
            //fs.writeFile(file.path + '.crx', crxBuffer);
        }, showError);

    }

    return through.obj(transform);
};