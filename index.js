'use strict';

var fs = require("fs");
var ChromeExtension = require("crx");
var join = require("path").join;
var through = require('through');

module.exports = function (opts) {
    opts = opts || {};

    var extensionData = {};
    extensionData.codebase = opts.codebase;
    privateKey.codebase = fs.readFileSync(join(opts.privateKey.dirname, opts.privateKey.name));

    var crx = new ChromeExtension(extensionData);

    //var crx = new ChromeExtension({
    //    codebase: "http://localhost:8000/myFirstExtension.crx",
    //    privateKey: fs.readFileSync(join(__dirname, "key.pem"))
    //});

    var extName = opts.extName || __dirname;

    return through(function (file) {
        console.log('start');
        crx.load(join(__dirname, extName))
            .then(function () {
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