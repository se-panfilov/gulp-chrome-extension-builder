'use strict';

var fs = require("fs");
var ChromeExtension = require("crx");
var join = require("path").join;
var through = require('through');

module.exports = function (opts) {
    opts = opts || {};

    var extensionData = {};
    extensionData.codebase = opts.codebase;
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

    return through(function (file) {
        this.queue(file);
        console.log('start');
        var crx = new ChromeExtension(extensionData);

        crx.load(join(file.path, extName)).then(function () {
            return crx.pack().then(function (crxBuffer) {
                var updateXML = crx.generateUpdateXML();

                fs.writeFile(join(__dirname, "update.xml"), updateXML);
                fs.writeFile(join(__dirname, extName + ".crx"), crxBuffer);
            });
        });
    }, function () {
        console.log('end');
    });
};