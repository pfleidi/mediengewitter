/*!
 * websocket.js is the websocket component of mahBucket
 *
 * @author pfleidi
 */

var Fs = require('fs');
var Sys = require('sys');
var Io = require('socket.io');
var MODULE_FOLDER = __dirname + "/modules/";
var IMAGE_PATH = "public/content/";
var NEW_IMAGES_FILE = IMAGE_PATH + "imageSum";
var DELAY = 7500;

exports.createWebsocketServer = function (app, log) {

  var modules = {};
  var imageCache = require('./imagecache').createCache(NEW_IMAGES_FILE, log);

  function _dispatch(msg, connection) {
    log.debug(Sys.inspect(msg));
    modules[msg.type].dispatch(msg.payload, connection);
  }

  function _getPluginName(fileName) {
    return fileName.split('\.')[0];
  }

  var webSocketServer = Io.listen(app, {
      flashPolicyServer: false
    });

  webSocketServer.on('connection', function (connection) {
      var cache = imageCache.cache();
      connection.send(JSON.stringify(cache));

      connection.on('message', function (message) {
          try {
            var msg = JSON.parse(message);
            _dispatch(msg, connection);
          } catch (err) {
            log.error('Couldn\'t parse or eval message: ' + err.stack);
          }
        }); 
    });

  (function initClientModules() {
      Fs.readdirSync(MODULE_FOLDER).forEach(function (file) {
          if (/\.js$/.test(file)) {
            var name = _getPluginName(file);
            modules[name] = require(MODULE_FOLDER + name).create(log, webSocketServer);
            log.debug('Loaded client module: ' + name);
          }
        });
    }());

  (function broadcastNextImage() {
      var currImage = imageCache.nextImage();
      var toSend = JSON.stringify(currImage);
      log.info("Broadcasting image: " + currImage.payload.data);
      webSocketServer.broadcast(toSend);
      setTimeout(broadcastNextImage, DELAY);
    }());
};
