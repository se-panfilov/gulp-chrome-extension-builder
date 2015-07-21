'use strict';

var fs = require("fs");
var ChromeExtension = require("crx");
var join = require("path").join;
var Stream = require('stream');
//var Path = require('path');

function gulpCrxPkg(obj) {

    var stream = new Stream.Transform({objectMode: true});

    var crx = new ChromeExtension({
        codebase: "http://localhost:8000/myFirstExtension.crx",
        privateKey: fs.readFileSync(join(__dirname, "key.pem"))
    });

    stream._transform = function (file, unused, callback) {

        crx.load(join(__dirname, "myFirstExtension"))
            .then(function () {
                return crx.pack().then(function (crxBuffer) {
                    var updateXML = crx.generateUpdateXML();

                    fs.writeFile(join(__dirname, "update.xml"), updateXML);
                    fs.writeFile(join(__dirname, "myFirstExtension.crx"), crxBuffer);
                });
            });

        callback(null, file);
    };

    return stream;

}

module.exports = gulpCrxPkg;
