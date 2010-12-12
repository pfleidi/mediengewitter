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
Sys = require('sys'),
Log4js = require('log4js')(),
Io = require('socket.io'),
PORT = 8080,
WEBROOT = __dirname + '/static',
LOGFILE = __dirname + '/log/mediengewitter.log',
MODULE_FOLDER = __dirname + "/modules/";

Log4js.addAppender(Log4js.fileAppender(LOGFILE), 'mediengewitter');

var logger = Log4js.getLogger('mediengewitter');
logger.setLevel('DEBUG');

var modules = {};
function getPluginName(fileName) {
  return fileName.split('.')[0];
}



//TODO make options changeable via commandline params
var IMAGE_PATH = "static/content/",
NEW_IMAGES_FILE = IMAGE_PATH + "imageSum",
imageCache = require('./lib/imagecache.js').createCache(NEW_IMAGES_FILE, logger),
DELAY = 7500;

var logStream = Fs.createWriteStream(__dirname + '/log/access.log', {
    encoding: 'utf-8',
    flags: 'a'
  });

var httpServer = Connect.createServer(
  Connect.cache(),
  Connect.staticProvider(WEBROOT),
  Connect.gzip(),
  Connect.logger(),
  Connect.errorHandler({ showStack: true, dumpExceptions: true})
);

httpServer.listen(PORT, function () {
    logger.debug('Webserver successfully started.');
  });

var webSocketServer = Io.listen(httpServer, {
    flashPolicyServer: false
  });

(function initModules() { // client side modules
  Fs.readdirSync(MODULE_FOLDER).forEach(function (file) {
      if (/\.js$/.test(file)) {
        var name = getPluginName(file),
        logger = Log4js.getLogger(name);

        modules[name] = require(MODULE_FOLDER + name).create(logger,webSocketServer);
        logger.debug('loaded client module :'+name);
    }
  });
}());

webSocketServer.on('connection', function (connection) {
    var cache = imageCache.cache();
    connection.send(JSON.stringify(cache));


    connection.on('message', function (message) {
      try {
        var msg = JSON.parse(message);
        dispatch(msg,connection);
      } catch (err) {
        logger.error('Cannot parse or eval message:' + err);
      }
      }); 
  });

function dispatch(msg,connection) {
  logger.debug(Sys.inspect(msg));
  logger.debug(Sys.inspect(modules))
  modules[msg.type].dispatch(msg.payload,connection);
}

(function doAction() {
    var currImage = imageCache.nextImage();
    //TODO pfleidi writes unit tests
    logger.info("Current Image is : " + currImage.payload.data);
    var toSend = JSON.stringify(currImage);
    webSocketServer.broadcast(toSend);
    setTimeout(doAction, DELAY);
  }());
