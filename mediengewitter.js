var
sys = require('sys'),
path = require('path'),
http = require('http'),
logging = require('./lib/streamlogger'),
paperboy = require('./lib/paperboy'),
io = require('./lib/socket.io.js'),
logger = new logging.StreamLogger('./log/mediengewitter.log'),
PORT = 8080,
WEBROOT = path.join(path.dirname(__filename), 'static');

logger.level = logger.levels.debug;

var server = http.createServer(function(req, res) {
  var ip = req.connection.remoteAddress;
  paperboy
  .deliver(WEBROOT, req, res)
  .addHeader('Expires', 300)
  .addHeader('X-PaperRoute', 'Node')
  .before(function() {
    sys.log('Received Request')
  })
  .after(function(statCode) {
    res.write('Delivered: '+req.url);
    log(statCode, req.url, ip);
  })
  .error(function(statCode,msg) {
    res.writeHead(statCode, {'Content-Type': 'text/plain'});
    res.write("Error: " + statCode);
    res.close();
    log(statCode, req.url, ip, msg);
  })
  .otherwise(function(err) {
    var statCode = 404;
    res.writeHead(statCode, {'Content-Type': 'text/plain'});
    log(statCode, req.url, ip, err);
  });
});

server.listen(PORT);

var socket = io.listen(server);

socket.on('connection', function(client) {

  setTimeout(function() {
    client.broadcast("Hallo!");
  }, 3000);

});



function log(statCode, url, ip,err) {
  var logStr = statCode + ' - ' + url + ' - ' + ip;
  if (err) {
    logStr += ' - ' + err;
  }
  logger.info(logStr);
}


