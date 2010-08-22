var
sys = require('sys'),
    path = require('path'),
    http = require('http'),
    fs = require('fs'),
    logging = require('./lib/streamlogger'),
    paperboy = require('./lib/paperboy'),
    io = require('./lib/socket.io'),
    logger = new logging.StreamLogger('./log/mediengewitter.log'),
    PORT = 8080,
    WEBROOT = path.join(path.dirname(__filename), 'static');

IMAGE_PATH = "./images/"
NEW_IMAGES_FILE= IMAGE_PATH+"imageSum"
DELAY=2000
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
/** 
  * calculates the next image from the given array
  *
  * @author     makefu
  * @date       2010-08-22    
  * @param      string the current Image
  * @param      array list of images
  * @return     next image
  */
function getImageName(currImage,data) {
    if ( currImage == null) {
        return data[0]
    }
    else {
        for (i=0; i< data.length-2 ; i++) {
            if ( data[i] == currImage ) {
                return data[i+1];
            }
        }
        logger.info("rewinding...")
        return data[0];
    }
}

var currImage = null; //TODO unGlobal me
function doAction() {
    // TODO refactor me!
    fs.readFile(NEW_IMAGES_FILE, "utf8", function(err,data){
        if (err) throw err; 
        currImage = getImageName(currImage,data.split('\n'));
        logger.info("Current Image is :"+currImage);
        fs.readFile(IMAGE_PATH+currImage,"binary",function(err,data){
            if (err) throw err;
            tmpBuf = new Buffer(data,'binary')
            data = tmpBuf.toString('base64')
            var ftype = currImage.split('.').pop();
            toSend = JSON.stringify({'data':data,'filetype':ftype});
            socket.broadcast(toSend);
        });
    });
    setTimeout(doAction,DELAY);
}
doAction();

function log(statCode, url, ip,err) {
    var logStr = statCode + ' - ' + url + ' - ' + ip;
    if (err) {
        logStr += ' - ' + err;
    }
    logger.info(logStr);
}


