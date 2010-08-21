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
  alert('got some data' + data);
});
