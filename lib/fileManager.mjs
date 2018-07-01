import debug from 'debug';
import fs from 'fs-extra';
import path from 'path';
import JSZip from 'jszip';

const d = debug('fm:file');

var FileManager = {};

FileManager._showAllFiles = false;

FileManager.toggleShowAllFiles = async function() {
    FileManager._showAllFiles = !FileManager._showAllFiles;
    return FileManager._showAllFiles;
}

FileManager.showAllFiles = async function() {
    return FileManager._showAllFiles;
}

FileManager.getStats = async function(p) {
    var stats = await fs.stat(p);
    return {
        folder: stats.isDirectory(),
        size: stats.size,
        mtime: stats.mtime.getTime()
    };
};

FileManager._isImportantFile = function(file) {
    var filter = NODEFILEMANAGER.FILEFILTER;
    var isVisible = new RegExp(filter).test(file.name);
    return isVisible;
}

FileManager.list = async function(dirPath) {
    var files = await fs.readdir(dirPath);

    var stats = [];
    for (var i = 0; i < files.length; ++i) {
        var fPath = path.join(dirPath, files[i]);
        var stat = await FileManager.getStats(fPath);

        stat.name = files[i];
        if (FileManager._showAllFiles) {
            stats.push(stat);
        } else if (stat.folder || FileManager._isImportantFile(stat)) {
            stats.push(stat);
        }
    }
    return stats;
};

FileManager.remove = async function(p) {
    await fs.remove(p);
};

FileManager.mkdirs = async function(dirPath) {
    await fs.mkdirs(dirPath);
};

FileManager.move = async function(srcs, dest) {
    for (var i = 0; i < srcs.length; ++i) {
        var basename = path.basename(srcs[i]);
        await fs.move(srcs[i], path.join(dest, basename));
    }
};

FileManager.rename = async function(src, dest) {
    await fs.move(src, dest);
};

FileManager.archive = async function(src, archive, dirPath, embedDirs) {
    var zip = new JSZip();
    var baseName = path.basename(archive, '.zip');

    d('creating zip: ' + baseName);

    async function addFile(file) {
        d('.. adding file: ' + file);
        var data = await fs.readFile(file);
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
        d(
            'Added ' + name + ' ' + data.length + ' bytes to archive ' + archive
        );
    }

    async function addDir(dir) {
        d('.. adding dir: ' + dir);

        var contents = await fs.readdir(dir);
        for (var file of contents) {
            await process(path.join(dir, file));
        }
    }

    async function process(fp) {
        var stat = await fs.stat(fp);
        if (stat.isDirectory()) {
            await addDir(fp);
        } else {
            await addFile(fp);
        }
    }

    // Add each src.  For directories, do the entire recursive dir.
    for (var file of src) {
        await process(file);
    }

    // Generate the zip and store the final.
    var data = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE'
    });
    await fs.writeFile(archive, data, 'binary');
};

export default FileManager;
