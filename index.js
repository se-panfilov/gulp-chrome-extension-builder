'use strict';

var fs = require("fs");
var ChromeExtension = require("crx");
var join = require("path").join;
var through = require('through');
var mkdir = require('mkdirp');
var async = require('async');

module.exports = function (opts) {
    opts = opts || {};

    var REQUIRED_PROPERTIES = ['manifest_version', 'name', 'version'];

    function getExtDir(rootPath) {
        return join(rootPath, extName);
    }

    var extensionData = {};
    extensionData.codebase = opts.codebase;
    extensionData.zip = extensionData.zip || false;
    var key = null;

    if (opts.privateKey) {
        key = {};
        key.dirname = opts.privateKey.dirname;
        key.name = opts.privateKey.name;
        privateKey.privateKey = fs.readFileSync(join(key.dirname, key.name));
    }


    //var crx = new ChromeExtension({
    //    codebase: "http://localhost:8000/myFirstExtension.crx",
    //    privateKey: fs.readFileSync(join(__dirname, "key.pem"))
    //});

    var extName = opts.extName || 'demoExt';

    function load(crx) {
        return crx.load(getExtDir(file.path)).then(function () {
            return crx.loadContents();
        });
    }

    function makeZip(crx, promise, path, extName) {
        return promise.then(function (archiveBuffer) {
            var updateXML = crx.generateUpdateXML();
            fs.writeFile(join(path, "update.xml"), updateXML);
            fs.writeFile(join(path, extName + '.zip'), archiveBuffer);
            return crx.pack(archiveBuffer);
        })
    }

    function mareCrx(crx, promise, path, extName) {
        return promise.then(function (crxBuffer) {
            var updateXML = crx.generateUpdateXML();
            fs.writeFile(join(path, "update.xml"), updateXML);
            fs.writeFile(join(path, extName + '.crx'), crxBuffer);
        });
    }

    return through(function (file) {
        this.queue(file);

        console.log('start');

        var crx = new ChromeExtension(extensionData);
        var crxPromise = load(crx);
        if (extensionData.zip) {
            makeZip(crx, crxPromise, file.path, extName);
        } else {
            mareCrx(crx, crxPromise, file.path, extName);
        }

        //crx.load(getExtDir(file.path)).then(function () {
        //    return crx.pack().then(function (crxBuffer) {
        //        var updateXML = crx.generateUpdateXML();
        //
        //        fs.writeFile(join(__dirname, "update.xml"), updateXML);
        //        fs.writeFile(join(__dirname, extName + ".crx"), crxBuffer);
        //    });
        //});

        console.log('done');

    }, function () {
        console.log('end');
    });
};