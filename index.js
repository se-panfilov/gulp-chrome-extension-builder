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

    function build(ChromeExtension, callback) {
        async.series([
            mkdir.bind(null, path.dirname(ChromeExtension.dest)),
            function (done) {
                ChromeExtension.load().then(function () {
                    done();
                }).catch(done);
            },
            function removeExcluded(done) {
                async.each(ChromeExtension._excludedFiles.map(function (f) {
                    return path.join(ChromeExtension.path, f);
                }), rm, done);
            },
            function finallyPackFiles(next) {
                ChromeExtension.loadContents().then(function writeZipArchive(archiveBuffer) {
                    if (ChromeExtension.zipDest) {
                        //grunt.file.write(ChromeExtension.zipDest, archiveBuffer);
                        //fs.writeFile(join(__dirname, extName + ".crx"), archiveBuffer);
                        fs.writeFile(ChromeExtension.zipDest, archiveBuffer);
                    }
                    return archiveBuffer;
                }).then(function writeCrxArchive(archiveBuffer) {
                    return ChromeExtension.pack().then(function (data) {
                        //grunt.file.write(ChromeExtension.dest, data);
                        //fs.writeFile(join(__dirname, extName + ".crx"), data);
                        fs.writeFile(ChromeExtension.dest, data);
                    });
                }).then(function () {
                    next();
                }).catch(next);
            }
        ], callback);
    }

    function getExtDir(rootPath) {
        return join(rootPath, extName);
    }


    function expandConfiguration(opts, rootPath) {
        var crxConfig = {
            maxBuffer: opts.maxBuffer || undefined
        };

        // The source dir is where the manifest.json file is located
        var sourceDir = getExtDir(rootPath);

        crxConfig.rootDirectory = sourceDir;
        crxConfig.manifest = require(path.resolve(sourceDir, 'manifest.json'));

        if (fs.existsSync(path)) {
            console.error('Unable to locate your private key at path "' + opts.privateKey + '".');
        } else {
            crxConfig.privateKey = fs.readFile(opts.privateKey);
        }

        // Check extension manifest
        REQUIRED_PROPERTIES.forEach(function (prop) {
            if ('undefined' === typeof crxConfig.manifest[prop]) {
                console.error('Invalid manifest: property "' + prop + '" is missing.');
            }
        });

        var processKeys = ['dest', 'zipDest'];

        // process file name template(s)
        processKeys.forEach(function (key) {
            if (!opts[key]) {
                return;
            }

            var filename = opts[key];

            if (!path.extname(opts[key])) {
                filename = opts[filename_template[key].optionFilenameKey] || filename_template_base + filename_template[key].suffix;

                filename = path.join(opts[key], filename);
            }


            opts[key] = grunt.template.process(filename, {
                "data": {
                    "manifest": crxConfig.manifest,
                    "pkg": require(path.resolve(process.cwd(), 'package.json'))
                }
            });
        });

        crxConfig.dest = opts.dest;
        crxConfig.zipDest = opts.zipDest;
        crxConfig.codebase = opts.baseURL || opts.codebase || null;

        if (crxConfig.codebase && !/.crx$/.test(crxConfig.codebase)) {
            crxConfig.codebase = crxConfig.codebase.replace(/\/$/, '');
            crxConfig.codebase += '/' + path.basename(opts.dest);
        }

        return crxConfig;
    }

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

        crx.load(getExtDir(file.path)).then(function () {
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