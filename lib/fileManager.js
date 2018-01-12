var fs = require("co-fs");
var co = require("co");
var fse = require("co-fs-extra");
var path = require("path");
var JSZip = require("jszip");

var FileManager = {};

FileManager._showAllFiles = false;

FileManager.toggleShowAllFiles = function*() {
  FileManager._showAllFiles = !FileManager._showAllFiles;
  return FileManager._showAllFiles;
}

FileManager.showAllFiles = function*() {
  return FileManager._showAllFiles;
}

FileManager.getStats = function*(p) {
    var stats = yield fs.stat(p);
    return {
        folder: stats.isDirectory(),
        size: stats.size,
        mtime: stats.mtime.getTime()
    };
};

FileManager._isImportantFile = function(file) {
  var isArchive = /zip|tar.gz|7z|7zip|tar|gz|tgz|tbz|tar.bz2|tar.bz/.test(file.name);
  var isGeoFile = /shp|dbf|shx/.test(file.name);
  return isArchive | isGeoFile;
}

FileManager.list = function*(dirPath) {
    var files = yield fs.readdir(dirPath);

    var stats = [];
    for (var i = 0; i < files.length; ++i) {
        var fPath = path.join(dirPath, files[i]);
        var stat = yield FileManager.getStats(fPath);

        stat.name = files[i];
        if (FileManager._showAllFiles) {
            stats.push(stat);
        } else if (stat.folder || FileManager._isImportantFile(stat)) {
            stats.push(stat);
        }
    }
    return stats;
};

FileManager.remove = function*(p) {
    yield fse.remove(p);
};

FileManager.mkdirs = function*(dirPath) {
    yield fse.mkdirs(dirPath);
};

FileManager.move = function*(srcs, dest) {
    for (var i = 0; i < srcs.length; ++i) {
        var basename = path.basename(srcs[i]);
        yield fse.move(srcs[i], path.join(dest, basename));
    }
};

FileManager.rename = function*(src, dest) {
    yield fse.move(src, dest);
};

FileManager.archive = function*(src, archive, dirPath, embedDirs) {
    var zip = new JSZip();
    var baseName = path.basename(archive, ".zip");

    function* addFile(file) {
        var data = yield fs.readFile(file);
        var name;
        if (embedDirs) {
            name = file;
            if (name.indexOf(dirPath) === 0) {
                name = name.substring(dirPath.length);
            }
        } else {
            name = path.basename(file);
        }
        zip.file(name, data);
        C.logger.info(
            "Added " + name + " " + data.length + " bytes to archive " + archive
        );
    }

    function* addDir(dir) {
        var contents = yield fs.readdir(dir);
        for (var file of contents) {
            yield* process(path.join(dir, file));
        }
    }

    function* process(fp) {
        var stat = yield fs.stat(fp);
        if (stat.isDirectory()) {
            yield* addDir(fp);
        } else {
            yield addFile(fp);
        }
    }

    // Add each src.  For directories, do the entire recursive dir.
    for (var file of src) {
        yield* process(file);
    }

    // Generate the zip and store the final.
    var data = yield zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE"
    });
    yield fs.writeFile(archive, data, "binary");
};

module.exports = FileManager;
