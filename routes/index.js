var express = require('express');
var router = express.Router();
var config = require('../config.json');
var root = config.dataRoot;
var fs = require('fs');
var path = require('path');

router.get('/*', function (req, res) {
    var url = req.params[0];
    var currentPath = path.join(root, url);
    fs.exists(currentPath, function (exists) {
        if (exists) {
            if (fs.lstatSync(currentPath).isDirectory()) {
                return handleDirectory(url, res);
            } else {
                return download(url, res);
            }
        } else {
            return handleError('does not exist', res);
        }
    });
});

Date.prototype.formatShort = function () {
    return this.getDate() +
        "-" + (this.getMonth() + 1) +
        "-" + this.getFullYear() +
        " " + this.getHours() +
        ":" + this.getMinutes();
};

function humanFileSize(bytes, si) {
    var thresh = si ? 1000 : 1024;
    if (bytes < thresh) return bytes + ' b';
    var units = ['kb', 'mb', 'gb', 'tb', 'pb', 'eb', 'zb', 'yb'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while (bytes >= thresh);
    return bytes.toFixed(1) + ' ' + units[u];
}

function findParentDir(currentPath) {
    return '/' + path.join(currentPath, '../');
}

function handleDirectory(url, res) {
    var fullPath = path.join(root, url);

    var atRoot = false;
    if (fullPath == root) {
        atRoot = true;
    }

    fs.readdir(fullPath, function (err, files) {
        if (err) {
            return handleError(err, res);
        }

        var outFiles = [];
        files.forEach(function (file) {
            var fullPath = path.join(url, file);
            var stats = fs.statSync(fullPath);
            var isDir = stats.isDirectory();
            var mtime = stats.mtime;
            var size = '-';
            if (!isDir) {
                size = humanFileSize(stats.size);
            }
            if (mtime) {
                mtime = mtime.formatShort();
            }

            outFiles.push({name: file, path: '/' + fullPath, isDir: isDir, mtime: mtime, size: size});

        });

        var parentDir = findParentDir(url);

        res.render('index', {title: config.appName, files: outFiles, atRoot: atRoot, parentDir: parentDir});
    });
}

function download(download, res) {
    var fullPath = path.join(root, download);
    console.log('download', fullPath);
    return res.sendFile(fullPath);
}

function handleError(err, res) {
    res.status(404).send(err);
}
module.exports = router;
