/*!
 * mediengewitter.js is the server component of mediengewitter
 *
 * It combines connect middleware
 * with a websocket-server which is able to push pictures
 * to our clients.
 *
 * @author pfleidi
 * @author makefu
 *
 */

var Connect = require('connect'),
Fs = require('fs'),
Log4js = require('log4js'),
Io = require('socket.io'),
Http = require('http'),
PORT = 8080,
WEBROOT = __dirname + '/static',
LOGFILE = __dirname + '/log/mediengewitter.log';

Log4js.loadAppender('file');
Log4js.addAppender(Log4js.appenders.file(LOGFILE), 'mediengewitter');

var logger = Log4js.getLogger('mediengewitter');
logger.setLevel('DEBUG');

//TODO make options changeable via commandline params
var IMAGE_PATH = "static/content/",
NEW_IMAGES_FILE = IMAGE_PATH + "imageSum",
imageCache = require('./lib/imagecache').createCache(NEW_IMAGES_FILE, logger),
DELAY = 7500;

var logStream = Fs.createWriteStream(__dirname + '/log/access.log', {
    encoding: 'utf-8',
    flags: 'a'
  });

var app = Connect();
var httpServer = Http.createServer(app);

[
  Connect.static(WEBROOT),
  Connect.compress(),
  Connect.logger(),
  Connect.errorHandler({ showStack: true, dumpExceptions: true})
].forEach(function (middleware) {
  app.use(middleware);
});

httpServer.listen(PORT, function () {
    logger.debug('Webserver successfully started.');
  });

var webSocketServer = Io.listen(httpServer, {
    flashPolicyServer: false,
    log: function () { logger.debug }
  });

webSocketServer.on('connection', function (connection) {
    var cache = imageCache.cache();
    connection.send(JSON.stringify(cache));

    connection.on('message', function(message) {
        log.info('Got msg: ' + message);
      });
  });

(function doAction() {
    var currImage = imageCache.nextImage();
    logger.info("Current Image is : " + currImage);
    var toSend = JSON.stringify({ data: 'content/' + currImage });
    webSocketServer.sockets.send(toSend);
    setTimeout(doAction, DELAY);
  }());


