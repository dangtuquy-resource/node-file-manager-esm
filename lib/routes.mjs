import debug from 'debug';
import fs from 'fs-extra';
import path from 'path';
import origFs from 'fs';
import koaRouter from 'koa-router';
import bodyParser from 'koa-bodyparser';
import formParser from 'await-busboy';

import Tools from './tools.mjs';
import fileMap from './fileMap.mjs'; const FilePath = fileMap.filePath;
import FileManager from './fileManager.mjs';

const d = debug('fm:routes');


var router = new koaRouter();

router.get('/', async (ctx, next) => {
    d('redirecting to /files');
    ctx.redirect( (ctx.mountPath || '') + '/files');
});

router.get('/files', async (ctx, next) => {
    d('getting files ui');
    ctx.status = 200;
    ctx.type = 'text/html; charset=utf-8';
    ctx.body = await fs.readFile(path.join( NODEFILEMANAGER.BASEPATH, './lib/views/files.html'));
});

router.put('/api/options', async (ctx, next) => {
    var type = ctx.query.type;
    var p = ctx.request.fPath;

    if (!type) {
        ctx.status = 400;
        ctx.body = 'Lack Arg Type';
    } else if (type === 'TOGGLE_SHOW_ALL_FILES') {
        ctx.body = await FileManager.toggleShowAllFiles(null);
    } else if (type === 'GET_SHOW_ALL_FILES') {
        ctx.body = await FileManager.showAllFiles();
        console.log(ctx.body)
    } else if (type === 'SHOW_ALL_FILES_ON') {
        ctx.body = await FileManager.toggleShowAllFiles(true);
    } else if (type === 'SHOW_ALL_FILES_OFF') {
        ctx.body = await FileManager.toggleShowAllFiles(false);
    } else if (type === 'GET_FILE_FILTER') {
        ctx.body = NODEFILEMANAGER.FILEFILTER;
    } else {
        ctx.status = 400;
        ctx.body = 'Arg Type Error!';
    }
});

router.get('/api/(.*)', Tools.loadRealPath, Tools.checkPathExists, async (ctx, next) => {
    var p = ctx.request.fPath;
    var stats = await fs.stat(p);
    if (stats.isDirectory()) {
        ctx.body = await FileManager.list(p);
    } else {
        //ctx.body = await fs.createReadStream(p);
        ctx.body = origFs.createReadStream(p);
    }
});

router.del('/api/(.*)', Tools.loadRealPath, Tools.checkPathExists, async (ctx, next) => {
    var p = ctx.request.fPath;
    await FileManager.remove(p);
    ctx.body = 'Delete Succeeded!';
});

router.put(
    '/api/(.*)',
    Tools.loadRealPath,
    Tools.checkPathExists,
    bodyParser(),
    async (ctx, next) => {
        var type = ctx.query.type;
        var p = ctx.request.fPath;

        console.log(type, p);

        if (!type) {
            ctx.status = 400;
            ctx.body = 'Lack Arg Type';
        } else if (type === 'MOVE') {
            var src = ctx.request.body.src;
            if (!src || !(src instanceof Array)) return (ctx.status = 400);
            var src = src.map(function(relPath) {
                return FilePath(relPath, true);
            });
            await FileManager.move(src, p);
            ctx.body = 'Move Succeed!';
        } else if (type === 'RENAME') {
            var target = ctx.request.body.target;
            if (!target) return (ctx.status = 400);
            await FileManager.rename(p, FilePath(target, true));
            ctx.body = 'Rename Succeed!';
        } else {
            ctx.status = 400;
            ctx.body = 'Arg Type Error!';
        }
    }
);

router.post(
    '/api/(.*)',
    Tools.loadRealPath,
    Tools.checkPathNotExists,
    bodyParser(),
    async (ctx, next) => {
        var type = ctx.query.type;
        var p = ctx.request.fPath;
        if (!type) {
            ctx.status = 400;
            ctx.body = 'Lack Arg Type!';
        } else if (type === 'CREATE_FOLDER') {
            await FileManager.mkdirs(p);
            ctx.body = 'Create Folder Succeed!';
        } else if (type === 'UPLOAD_FILE') {
            var formData = await formParser(ctx.req);
            if (formData.fieldname === 'upload') {
                var writeStream = origFs.createWriteStream(p);
                formData.pipe(writeStream);
                ctx.body = 'Upload File Succeed!';
            } else {
                ctx.status = 400;
                ctx.body = 'Lack Upload File!';
            }
        } else if (type === 'CREATE_ARCHIVE') {
            var src = ctx.request.body.src;
            if (!src) return (ctx.status = 400);
            src = src.map(function(file) {
                return FilePath(file, true);
            });
            var archive = p;
            await FileManager.archive(
                src,
                archive,
                NODEFILEMANAGER.DATA_ROOT,
                !!ctx.request.body.embedDirs
            );
            ctx.body = 'Create Archive Succeed!';
        } else {
            ctx.status = 400;
            ctx.body = 'Arg Type Error!';
        }
    }
);

export default router.middleware();
