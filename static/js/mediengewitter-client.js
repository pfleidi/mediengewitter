/*!
 * Mediengewitter client.
 *
 * Connects to a socket.io server and reacts to events
 *
 * @author pfleidi
 *
 */

io.setPath('js/socket.io/');

var socket = new io.Socket(window.location.hostname, { port: window.location.port });
socket.connect();

socket.on('message', function(data){
  try {
    var imageData = JSON.parse(data);
    writeImage(imageData);
  } catch(e) {
    alert(e);
  }
});

function writeImage(imageData) {
  var image = document.getElementById("imagedata");
  image.src = getDataUri(imageData);
  adjustImageScale(image);
}

function adjustImageScale(img) {
  if(window.innerHeight < img.height){
    img.style.height = '100%';
    img.style.width = 'auto';
  }
  else if(window.innerWidth < img.width) {
    img.style.width = '100%';
    img.style.height = 'auto';
  }
}

function getDataUri(imageData) {
  return "data:image/" + imageData.filetype + ";base64," + imageData.data;
}
