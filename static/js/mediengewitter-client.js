/*!
 * Mediengewitter client.
 *
 * Connects to a websocket server and reacts to events
 *
 * @author pfleidi
 *
 */

(function (window, document, undefined) {
    var enabled = true;
    var sections = [];

    function isSupported() {
      return 'WebSocket' in window;
    }

    function addImage(imageData) {
      var next = $('<section><img src="' + imageData + '" /></section>');
      next.addClass('new');
      $('#container').append(next);

      sections.push(next);
    }

    function showImage(section) {
      if (section) {
        $('.current').removeClass('current').addClass('old');
        section.removeClass('new').addClass('current');
        adjustRatio();
      }
    }

    function adjustRatio() {
      var img = $('.current :first-child');
      console.log(img);
      img.aeImageResize({
          height: $('.current').height(),
          width: $('.current').width()
        });
    }

    function dispatch(imgData) {
      addImage(imgData);
      if (sections.length > 1) {
        showImage(sections.shift());
      }
    }

    function getWebSocketUri() {
      return "ws://"
      + window.location.hostname
      + ":" + window.location.port
      + "/websocket";
    }

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

        if (e.keyCode === 32) {
          e.preventDefault();
          enabled = !enabled;
        }
      });


    (function connect() {
        if (isSupported()) {
          var socket = new WebSocket(getWebSocketUri());

          socket.onmessage = function (msg) {
            console.log(msg.data);
            if (enabled) {
              var data = msg.data;
              var imageData = JSON.parse(data);

              dispatch(imageData.data);
            }
          };

          socket.onclose = function () {
            console.log('conncection closed');
            setTimeout(1000, connect);
          };
        }
      }())

  }(window, document));
