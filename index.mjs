/**
 * make the app mountable
 * 
 * @author Nabil Redmann 2018
 *
 * @example
 *    import fm from 'app-filemanager-2';
 *    var appFm = fm('/uploadpath', 'zip|txt|mp4').app;
 *    mainApp.use(mount('/fm', appFm));
 **/

import Koa from 'koa';
import path from 'path';
import mount from 'koa-mount';
import koaStatic from 'koa-static';
import debug from 'debug';
import Tools from './lib/tools';
import IndexRouter from './lib/routes';

if (!__dirname) var __dirname = path.resolve(path.dirname(decodeURI(new URL(import.meta.url).pathname))); // fix node module -- fucks up babel



const fm = function init(pathToWatch, filefilter) {

  global.NODEFILEMANAGER = {
    BASEPATH: __dirname,
    DATA_ROOT: pathToWatch || __dirname,
    FILEFILTER: filefilter || 'zip|tar.gz|7z|7zip|tar|gz|tgz|tbz|tar.bz2|tar.bz|txt|jpg|png|avi|mp4'
  };


  var app = new Koa();  
  
  app.proxy = true;
  app.use(Tools.logTraffic);
  app.use(Tools.handelError);
  app.use(Tools.realIp);

  app.use(IndexRouter)

  app.use(koaStatic(path.join(__dirname,'./lib/public/')));

  fm.app = app;

  return fm;
}
fm.app = null;

export default fm;