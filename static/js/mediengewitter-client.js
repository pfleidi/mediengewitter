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

  function createCache(initData) {
    var out = {};

    $('#container').empty();

    out.stopped = false;
    out.cacheItems = [];
    out.cacheFoot = [];
    out.center = Math.floor((initData.length + 1)/2);
    out.current = out.center;

    initData.forEach(function (img) {
      var item = genItem(img),
      footItem = genFootItem(img),
      i = initData.indexOf(img) + 1;
      
      if (i < out.current) {
        item.addClass('old');
      }

      if (i == out.current) {
        item.addClass('current');
        footItem.addClass('current_footitem');
      }

      if (i > out.current) {
        item.addClass('new');
      }
      out.cacheItems.push(item);
      out.cacheFoot.push(footItem);
    });

    out.update = function (newData) {
      if (!out.stopped) {
        out.cacheItems.push(genItem(newData).addClass('new'));
        out.cacheFoot.push(genFootItem(newData));

        if ( out.current  <= out.center) { // get back to center 
          this.next();
        }

        $('#container :first').remove()
        $('#foot_center :first').remove()
        out.cacheItems.shift();
        out.cacheFoot.shift()
        out.current -= 1;
      }
    };

    out.next = function () {
      if (!(out.current == out.cacheItems.length)) {
        $('.current').removeClass('current').addClass('old').next().removeClass('new').addClass('current');
        $('.current_footitem').removeClass('current_footitem').next().addClass('current_footitem');
        out.current += 1;
        //$('#container :nth-child('+(out.current) +')').removeClass('new').addClass('current');
        adjustRatio();
      } else {
        console.log('Already at the last image');
      }
    };

    out.prev = function () {
      if (!(out.current == 1)) {
        $('.current').removeClass('current').addClass('new').prev().removeClass('old').addClass('current');
        $('.current_footitem').removeClass('current_footitem').prev().addClass('current_footitem');
        out.current -= 1;
        adjustRatio();
      } else{
        console.log('Already at the first image');
      }
    };

    out.toggleStop = function () {
      out.stopped = !out.stopped;
    }
    return out;

  }

  var enabled = true,
  sections = [];

  function isSupported() {
    return 'WebSocket' in window;
  }

  function genItem(imageData) {
    var next = $('<section><img src="' + imageData + '" /></section>');
    $('#container').append(next);
    return next;
  }

  function genFootItem(imageData) {
    var next = $('<img src="'+imageData+'" />');
    next.addClass('foot_item');
    $('#foot_center').append(next);
    return next;
  }

  function adjustRatio() {
    var img = $('.current :first-child');
    console.log(img);
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

  (function connect() {
    if (isSupported()) {
      var socket = new WebSocket(getWebSocketUri());

      socket.onmessage = function (msg) {
        var data = msg.data, 
        imageData = JSON.parse(data);
        console.dir(imageData);

        if (Array.isArray(imageData)) {
          cache = createCache(imageData);
        } else {
          cache.update(imageData.data);
        }

      };

      socket.onclose = function () {
        console.log('Connection closed');
        setTimeout(1000, connect);
      };
    };
    
  }())

}(window, document));
