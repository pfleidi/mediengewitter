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

var Sys   = require('sys'),
Connect   = require('connect'),
Websocket = require('websocket-server'),
Fs        = require('fs'),
logging   = require('./lib/streamlogger'),
logger    = new logging.StreamLogger('./log/mediengewitter.log'),
PORT      = 8080,
WEBROOT   = __dirname + '/static';

logger.level = logger.levels.debug;

//TODO make options changeable via commandline params
var IMAGE_PATH = "./images/";
var NEW_IMAGES_FILE = IMAGE_PATH + "imageSum";
var DELAY = 5000;

var httpServer = Connect.createServer(
  Connect.cache(),
  Connect.staticProvider(WEBROOT),
  Connect.gzip(),
  Connect.errorHandler({ showStack: true })
);


httpServer.listen(PORT);

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

var currImage = null; //TODO unGlobal me

function doAction() {
  // TODO refactor me!
  Fs.readFile(NEW_IMAGES_FILE, "utf8", function (err, data) {
      if (err) {
        throw err;
      }
      currImage = getImageName(currImage, data.split('\n'));
      logger.info("Current Image is :" + currImage);
      Fs.readFile(IMAGE_PATH + currImage, "binary", function (err, data) {
          if (err) {
            throw err;
          }

          var tmpBuf = new Buffer(data, 'binary'),
          base64data = tmpBuf.toString('base64'),
          fileType = currImage.split('.').pop(),
          toSend = JSON.stringify({'data': base64data, 'filetype': fileType});

          webSocketServer.broadcast(toSend);
        });
    });
  setTimeout(doAction, DELAY);
}

doAction();
