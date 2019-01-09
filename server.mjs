#!/usr/bin/env node

import debug from 'debug';
process.argv.forEach((val, index) => {
  let params = val.split('=');
  if ('--log' == params[0].toLocaleLowerCase() || '-l' == params[0].toLocaleLowerCase()) {
    let param = params.length == 2 ? params.pop() : '*';
    debug.enable('fm:' + param);
  }
});

import url from 'url';
import auth from 'http-auth';
import path from 'path';
//import tracer from 'tracer';
import Koa from 'koa';
import mount from 'koa-mount';
import koaStatic from 'koa-static';
import opn from 'opn';

import package_json from './package.json';

const d = debug('fm:start');

let __dir_name = (typeof __dirname !== 'undefined') ? __dirname : '';
if (!__dir_name) {
    const im = import.meta;
    __dir_name = path.resolve(path.dirname(decodeURI(new url.URL(im.url).pathname))); // fix node module -- fucks up babel
}


// Config
import optimist from 'optimist';

let argv = optimist
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
        description: 'Use BASIC-AUTH with the htpasswd of the path provided, or the htpasswd within the current directory'
    })
    .option('version', {
        alias: 'v',
        description: 'Server　Version'
    })
    .option('logging', {
        alias: 'l',
        description: 'output logging info, must be -l=xyz or --logout=xyz [using just -l or --logout resolves to --logout=* and can be set as environment variable with DEBUG=fm:* as well]'
    })
    .option('open', {
        alias: 'o',
        description: 'Open the website to this service'
    })
    .option('help', {
        alias: 'h',
        description: 'Display This Help Message'
    })
    .argv;

if (argv.help) {
    optimist.showHelp(console.log);
    process.exit(0);
}

if (argv.version) {
    console.log('FileManager', package_json.version);
    process.exit(0);
}

if (argv.logging) {
    d('FileManager version ' + package_json.version);
}


global.NODEFILEMANAGER = {
    BASEPATH: __dir_name,
    DATA_ROOT: argv.directory || __dir_name,
    FILEFILTER: argv.filter || 'zip|tar.gz|7z|7zip|tar|gz|tgz|tbz|tar.bz2|tar.bz|txt|jpg|png|avi|mp4'
};

// Start Server
import Tools from './lib/tools';

let startServer = function(app, port) {
    app.listen(port, function() { if (argv.open) opn('http://localhost:'+port); });
    d('listening on *:' + port);
};

let app = new Koa();
app.name = 'filemanager';

app.proxy = true;
app.use(Tools.logTraffic);
app.use(Tools.handleError);
app.use(Tools.realIp);



// Enable auth.
if (argv.secure) {
    let htpasswd = path.resolve(__dir_name, (typeof argv.secure == 'string' ? argv.secure : './htpasswd'));

    let basic = auth.basic({
        realm: 'File manager',
        file: htpasswd
    });

    app.use(async function auth(ctx, next) {
        debug('fm:auth')('check');

        await basic.check(ctx.req, ctx.res, async (req, res, err) => {
            if (err) {
                debug('fm:auth:error')(err);
                throw err;
            } else {
                debug('fm:auth')('passed.');
            }
        });

        await next();
    });
}


import IndexRouter from './lib/routes';
app.use(IndexRouter);

app.use(koaStatic(path.join(__dir_name, './lib/public/')));



startServer(app, +argv.port);
