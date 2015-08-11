'use strict';

var fs = require("fs");
var ChromeExtension = require("crx");
var join = require("path").join;
var through = require('through2');
var gutil = require('gulp-util');
var merge = require('merge');

var PluginError = gutil.PluginError;


module.exports = function (opt) {

    var REQUIRED_PROPERTIES = ['manifest_version', 'name', 'version'];

    function transform(file, enc, cb) {
        //if (file.isNull()) return cb(null, file);
        if (file.isStream()) return cb(new PluginError('gulp-crx-pkg', 'Streaming not supported'));

        var options = merge({
            some: false
        }, opt);


        var extensionData = {};
        extensionData.codebase = options.codebase;
        extensionData.zip = extensionData.zip || false;
        var key = null;

        if (options.privateKey) {
            key = {};
            key.dirname = options.privateKey.dirname;
            key.name = options.privateKey.name;
            privateKey.privateKey = fs.readFileSync(join(key.dirname, key.name));
        }

        var crx = new ChromeExtension(extensionData);
        console.log('crx');


        crx.load(file.path).then(function () {
            return crx.loadContents();
        }).then(function (archiveBuffer) {
            fs.writeFile(file.path + '.zip', archiveBuffer);
            return crx.pack(archiveBuffer);
        }).then(function (crxBuffer) {
            fs.writeFile(file.path + '.crx', crxBuffer);
        });
    }

    return through.obj(transform);
};