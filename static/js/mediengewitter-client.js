/*!
 * Mediengewitter client.
 *
 * Connects to a websocket server and reacts to events
 *
 * @author pfleidi
 * @author felix
 *
 */


(function (window, document, undefined) {
  var cache = false;

  function log(msg) {
    try {
      console.log(msg);
    } catch (e) { }
  }

  function createCache(initData) {
    var out = {};

    $('#container').empty();

    out.stopped = false;
    out.cacheItems = [];
    out.thumbnails = [];

    out.center = Math.floor((initData.length + 1) / 2);
    out.current = out.center;

    initData.forEach(function (img) {
      var item = genItem(img),
      thumbnail = genThumbnail(img),
      i = initData.indexOf(img) + 1;

      if (i < out.current) {
        item.addClass('old');
      }

      if (i === out.current) {
        item.addClass('current');
        thumbnail.addClass('thumbnail_current');
      }

      if (i > out.current) {
        item.addClass('new');
      }

      out.cacheItems.push(item);
      out.thumbnails.push(thumbnail);
    });

    out.update = function (newData) {
      if (!out.stopped) {
        out.cacheItems.push(genItem(newData).addClass('new'));
        out.thumbnails.push(genThumbnail(newData));

        if (out.current <= out.center) { // get back to center
          this.next();
        }

        $('#container :first').remove();
        $('#thumbnails :first').remove();
        out.cacheItems.shift();
        out.thumbnails.shift();
        out.current -= 1;
      }
    };

    out.next = function () {
      if (!(out.current === out.cacheItems.length)) {
        $('.current').removeClass('current').addClass('old').next().removeClass('new').addClass('current');
        $('.thumbnail_current').removeClass('thumbnail_current').next().addClass('thumbnail_current');
        out.current += 1;
        adjustRatio();
      } else {
        log('Already at the last image');
      }
    };

    out.prev = function () {
      if (!(out.current === 1)) {
        $('.current').removeClass('current').addClass('new').prev().removeClass('old').addClass('current');
        $('.thumbnail_current').removeClass('thumbnail_current').prev().addClass('thumbnail_current');
        out.current -= 1;
        adjustRatio();
      } else {
        log('Already at the first image');
      }
    };

    out.toggleStop = function () {
      out.stopped = !out.stopped;
    };

    return out;
  }

  var enabled = true,
  sections = [];

  function isSupported() {
    return 'WebSocket' in window;
  }

  function connect() {
    if (isSupported()) {
      var socket = new WebSocket(getWebSocketUri());

      socket.onmessage = function (msg) {
        var data = msg.data,
        imageData = JSON.parse(data);

        if (Array.isArray(imageData)) {
          cache = createCache(imageData);
        } else {
          cache.update(imageData.data);
        }

      };

      socket.onerror = function () {
        log('Error!');
        setTimeout(1000, connect);
      };

      socket.onclose = function () {
        log('Connection closed');
        setTimeout(1000, connect);
      };
    }

  }

  function genItem(imageData) {
    var next = $('<section><img src="' + imageData + '" /></section>');
    $('#container').append(next);
    return next;
  }

  function genThumbnail(imageData) {
    var next = $('<img src="' + imageData + '" />');
    next.addClass('thumbnail');
    $('#thumbnails').append(next);
    return next;
  }

  function adjustRatio() {
    var img = $('.current :first-child');
    log(img);
    img.aeImageResize({
      height: $('.current').height(),
      width: $('.current').width()
    });
  }

  function getWebSocketUri() {
    return "ws://"
      + window.location.hostname
      + ":" + window.location.port
      + "/websocket";
  }

  $(document).ready(function () {
    adjustRatio();
    connect();
  });

  $(window).resize(function () {
    adjustRatio();
  });

  $(document).keydown(function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || !cache) {
      return;
    }

    if (e.keyCode === 32) {
      e.preventDefault();
      cache.toggleStop();
    }
    if (e.keyCode === 39) {
      e.preventDefault();
      cache.next();
    }
    if (e.keyCode === 37) {
      e.preventDefault();
      cache.prev();
    }
  });

}(window, document));
