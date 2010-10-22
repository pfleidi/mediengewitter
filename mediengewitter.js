/*!
 * mediengewitter.js is the server component of mediengewitter
 *
 * It combines a leigtweight http-server for static files 
 * with a websocket-server which is able to push pictures
 * to our clients.
 *
 * @author pfleidi
 * @author makefu
 *
 */

var Sys       = require('sys'),
    Connect   = require('connect'),
    Websocket = require('websocket-server'),
    Fs        = require('fs'),
    Log4js    = require('log4js'),
    Appender  = require('./lib/colorappender.js'),
    PORT      = 8080,
    WEBROOT   = __dirname + '/static',
    LOGFILE   = __dirname + '/log/mediengewitter.log';

Log4js.addAppender(Appender.consoleAppender());
Log4js.addAppender(Log4js.fileAppender(LOGFILE), 'mediengewitter');

var logger = Log4js.getLogger('mediengewitter');
logger.setLevel('DEBUG');

//TODO make options changeable via commandline params
var IMAGE_PATH = "static/content/",
    NEW_IMAGES_FILE = IMAGE_PATH + "imageSum",
    DELAY = 5500;

var httpServer = Connect.createServer(
  Connect.cache(),
  Connect.staticProvider(WEBROOT),
  Connect.gzip(),
  Connect.errorHandler({ showStack: true })
);

httpServer.listen(PORT, function () {
  logger.debug('Webserver successfully started.');
});

var webSocketServer = Websocket.createServer({
    debug: false,
    server: httpServer
  });

/** 
 * calculates the next image from the given array
 *
 * @author     makefu
 * @date       2010-08-22    
 * @param      string the current Image
 * @param      array list of images
 * @return     next image
 */

function getImageName(currImage, data) {
  if (!currImage) {
    return data[0];
  } else {
    return data[data.indexOf(currImage) + 1];
  }
  logger.info("rewinding...");
  return data[0];
}
var currImage = null; // UNglobalize me

(function doAction() {
  // TODO refactor me!
  Fs.readFile(NEW_IMAGES_FILE, "utf8", function (err, data) {
      if (err) {
        throw err;
      }
      currImage = getImageName(currImage, data.split('\n'));
      logger.info("Current Image is : " + currImage);
      toSend = JSON.stringify({'data': 'content/'+ currImage });
      webSocketServer.broadcast(toSend);
    });
  setTimeout(doAction, DELAY);
}());
