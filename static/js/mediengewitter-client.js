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
      img.css({'height': 'auto', 'width': 'auto' });

      if (img.width() <= img.height()) {
        img.css({'height': '99%', 'width': 'auto' });
      } else {
        img.css({'height': 'auto', 'width': '99%' });
      }
    }

    function getWebSocketUri() {
      return "ws://" 
      + window.location.hostname 
      + ":" + window.location.port
      + "/websocket";
    }

  }());
