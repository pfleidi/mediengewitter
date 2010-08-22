/*!
 * Mediengewitter client.
 *
 * Connects to a socket.io server and reacts to events
 *
 * @author pfleidi
 *
 */

(function() {

   if (isSupported()) {
      var socket = new WebSocket(getWebSocketUri());

      socket.onmessage = function(msg){
         var data = msg.data;
         var imageData = JSON.parse(data);
         writeImage(imageData);
      };

      socket.onclose = function() {
         alert("Connection closed");
      };
   }

   function isSupported() {
      return 'WebSocket' in window;
   };

   function writeImage(imageData) {
      var image = document.getElementById("imagedata");
      image.src = getDataUri(imageData);
      adjustImageScale(image);
   }


   function adjustImageScale(img) {
      img.style.width = 'auto';
      img.style.height= 'auto';
      if(img.width < img.height){
         img.style.height = '98%';
         img.style.width = 'auto';
      } else {
         img.style.height = 'auto';
         img.style.width = '98%';
      }
   }

   function getWebSocketUri() {
      return "ws://" 
      + window.location.hostname 
      + ":" + window.location.port
      + "/websocket";
   }

   function getDataUri(imageData) {
      return "data:image/" 
      + imageData.filetype 
      + ";base64," 
      + imageData.data;
   }

})();
