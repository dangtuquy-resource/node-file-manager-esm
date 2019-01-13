import fs from 'fs-extra';
import fileMap from './fileMap';
import debug from 'debug';

const de = debug('fm:error');
const di = debug('fm:info');
const dt = debug('fm:traffic');

const FilePath = fileMap.filePath;


export default {
  realIp: async (ctx, next) => {
      ctx.req.ip = ctx.headers['x-forwarded-for'] || ctx.ip;
      await next();
  },

  handleError: async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      
      ctx.status = err.status || 500;
      ctx.body = err.message;
      de(err.stack);

      if (ctx.app)
        ctx.app.emit('error', err, ctx);
    }
  },

  loadRealPath: async (ctx, next) => {
    // router url format must be /api/(.*)
    ctx.request.fPath = FilePath(ctx.params[0]);
    di(ctx.request.fPath);
    await next();
  },

  checkPathExists: async (ctx, next) => {
    // Must after loadRealPath
    if (!(await fs.exists(ctx.request.fPath))) {
      ctx.status = 404;
      ctx.body = ' Configured directory does not exist!';
      de('Configured directory (option `--directory`) does not exist: ', ctx.request.fPath);
    }
    else {
      await next();
    }
  },

  checkPathNotExists: async (ctx, next) => {
    // Must after loadRealPath
    if (await fs.exists(ctx.request.fPath)) {
      ctx.status = 400;
      ctx.body = 'Path exists!';
    }
    else {
      await next();
    }
  },


  logTraffic: async (ctx, next) => {
    const start = Date.now();

    await next();
    
    dt(ctx.method, ctx.url, ctx.status);

    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
  }

};
