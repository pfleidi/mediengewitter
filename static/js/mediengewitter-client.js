/*!
 * Mediengewitter client.
 *
 * Connects to a websocket server and reacts to events
 *
 * @author pfleidi
 *
 */

(function () {
    $(document).ready(function () {
        adjustRatio(); 
      });

    $(window).resize(function () {
        adjustRatio(); 
      });

    if (isSupported()) {
      var socket = new WebSocket(getWebSocketUri());

      socket.onmessage = function (msg) {
        var data = msg.data;
        var imageData = JSON.parse(data);

        writeImage(imageData);
      };

      socket.onclose = function () {
        console.log('conncection closed');
      };
    }

    function isSupported() {
      return 'WebSocket' in window;
    }

    function writeImage(imageData) {
      var imgSrc = imageData['data'];
      $('#imagedata').attr('src', imgSrc);
      adjustRatio();
    }

    function adjustRatio() {
      var img = $('#imagedata');
      img.aeImageResize({
          height: $('#container').height(),
          width: $('#container').width()
        });
    }

    function getWebSocketUri() {
      return "ws://" 
      + window.location.hostname 
      + ":" + window.location.port
      + "/websocket";
    }

  }());
