/*!
 * Mediengewitter client.
 *
 * Connects to a websocket server and reacts to events
 *
 * @author pfleidi
 *
 */

(function (window, undefined) {
    var enabled = true;

    $(document).ready(function () {
        adjustRatio(); 
      });

    $(window).resize(function () {
        adjustRatio(); 
      });

    $(document).keydown(function (e) {
        if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
          return;
        }
        
        if(e.keyCode === 32) {
           e.preventDefault();
           enabled = !enabled;
        }
      });


    (function connect() {
        if (isSupported()) {
          var socket = new WebSocket(getWebSocketUri());

          socket.onmessage = function (msg) {
            if (enabled) {
              var data = msg.data;
              var imageData = JSON.parse(data);

              writeImage(imageData);
            }
          };

          socket.onclose = function () {
            console.log('conncection closed');
            setTimeout(1000, connect);
          };
        }
      }())

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

  }(window));
