import Koa from 'koa';
import mount from 'koa-mount';

import appFilemanangerLoader from '../index';


const appMain = new Koa();

var appFilemananger = appFilemanangerLoader(null, 'zip|txt|mp4').app;

appMain.use(mount('/fm', appFilemananger));

appMain.use((ctx, next) => {
	ctx.body = 'go to /fm';
});


appMain.listen(3000);