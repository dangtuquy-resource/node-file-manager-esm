#!/usr/bin/env node

import debug from 'debug';
import auth from 'http-auth';
import path from 'path';
//import tracer from 'tracer';
import Koa from 'koa';
import mount from 'koa-mount';
import koaStatic from 'koa-static';

const d = debug('fm:start');


if (!__dirname) var __dirname = path.resolve(path.dirname(decodeURI(new URL(import.meta.url).pathname))); // fix node module -- fucks up babel


// Config
import optimist from 'optimist';

var argv = optimist
    .usage(['USAGE: $0 [-p <port>] [-d <directory>]'])
    .option('port', {
        alias: 'p',
        default: process.env.PORT || 5000,
        description: 'Server Port'
    })
    .option('directory', {
        alias: 'd',
        description: 'Root Files Directory'
    })
    .option('filter', {
        alias: 'f',
        description: 'Important files to filter for. Example: zip|mp4|txt'
    })
    .option('secure', {
        alias: 's',
        description: 'Use BASIC-AUTH with the htpasswd'
    })
    .option('version', {
        alias: 'v',
        description: 'Server　Version'
    })
    .option('help', {
        alias: 'h',
        description: 'Display This Help Message'
    })
    .argv;

if (argv.help) {
    require('optimist').showHelp(console.log);
    process.exit(0);
}

if (argv.version) {
    console.log('FileManager', require('./package.json').version);
    process.exit(0);
}

global.NODEFILEMANAGER = {
    BASEPATH: __dirname,
    DATA_ROOT: argv.directory || __dirname,
    FILEFILTER: argv.filter || 'zip|tar.gz|7z|7zip|tar|gz|tgz|tbz|tar.bz2|tar.bz|txt|jpg|png|avi|mp4'
};

// Start Server
import Tools from './lib/tools';

var startServer = function(app, port) {
    app.listen(port);
    d('listening on *.' + port);
};

var app = new Koa();
app.name = 'filemanager';


// Enable auth.
if (argv.secure) {
    app.use(async (ctx, next) => {
        try {
            await next;
        } catch (err) {
            console.log(err);
            ctx.body = err;
        }
    });

    app.use(auth.koa(auth.basic({
        realm: 'File manager',
        file: __dirname + '/htpasswd'
    })));
}


app.proxy = true;
app.use(Tools.logTraffic);
app.use(Tools.handelError);
app.use(Tools.realIp);

import IndexRouter from './lib/routes';
app.use(IndexRouter)

app.use(koaStatic(path.join(__dirname, './lib/public/')));


startServer(app, +argv.port);
