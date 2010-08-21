/*!
 * Mediengewitter client.
 *
 * Connects to a socket.io server and reacts to events
 *
 * @author pfleidi
 *
 */

var socket = new io.Socket('10.42.0.135');
socket.connect();
socket.send('some data');

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
}

function getDataUri(imageData) {
  return "data:image/" + imageData.filetype + ":base64," + imageData.data;
}

function doIt() {
  var content = "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9YGARc5KB0XV+IAAAAddEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIFRoZSBHSU1Q72QlbgAAAF1JREFUGNO9zL0NglAAxPEfdLTs4BZM4DIO4C7OwQg2JoQ9LE1exdlYvBBeZ7jqch9//q1uH4TLzw4d6+ErXMMcXuHWxId3KOETnnXXV6MJpcq2MLaI97CER3N0vr4MkhoXe0rZigAAAABJRU5ErkJggg==";
  writeImage({ data: content, filetype: "png" });
};
