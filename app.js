/*!
 * app.js is the server component of mahBucket
 *
 * @author pfleidi
 * @author makefu
 *
 */

var Express = require('express');
var Log4js = require('log4js')();
var Ws = require('./lib/websocket.js');
var PORT = 8080;
var LOGFILE = __dirname + '/logs/mahBucket.log';
var logger = Log4js.getLogger('mahBucket');

/* 
 * set up the application
 */
var app = module.exports = Express.createServer();

app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(Express.bodyDecoder());
    app.use(Express.cookieDecoder());
    app.use(Express.logger());
    app.use(Express.methodOverride());
    app.use(Express.session());
    app.use(Express.compiler({
        src: __dirname + '/public',
        enable: ['sass'] 
      }));
    app.use(app.router);
    app.use(Express.staticProvider(__dirname + '/public'));
  });

app.configure('development', function () {
    app.use(Express.errorHandler({
        dumpExceptions: true,
        showStack: true 
      }));
    logger.setLevel('WARNING');
  });

app.configure('production', function () {
    app.use(Express.errorHandler());
    Log4js.addAppender(Log4js.fileAppender(LOGFILE));
    logger.setLevel('WARNING');
  });

app.listen(PORT, function () {
    logger.info('mahBucket server listening on port' + app.address().port);
    Ws.createWebsocketServer(app, logger);
  });

/* Process Logging */

process.on('SIGINT', function () {
    logger.info('Got SIGINT. Exiting ...');
    process.exit(0);
  });

process.on('uncaughtException', function (err) {
    logger.fatal('RUNTIME ERROR! :' + err.stack);
  });
