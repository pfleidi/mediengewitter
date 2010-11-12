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

  function createCache(cacheSize,initData) {
    var out = {};
    $('#container').empty()
    out.stopped = false;
    out.cacheItems = [];
    out.center = Math.floor((cacheSize+1)/2)
    out.current = out.center;
    for (var i = 1; i <= cacheSize;i++) {
      var item = genItem(initData);
      if ( i < out.current ) {
        item.addClass('old');
      }

      if ( i == out.current ) {
        item.addClass('current');
      }

      if ( i > out.current ) {
        item.addClass('new');
      }
      out.cacheItems.push(item);
    }

    out.update = function (newData)
    {
      if ( ! out.stopped )
      {
        out.cacheItems.push(genItem(newData).addClass('new'));
        if ( out.current  <= out.center) { // get back to center 
          this.next();
        }

        $('#container :first').remove()
        out.cacheItems.shift();
        out.current -= 1;
      }
    }

    out.next = function () {
      if ( ! (out.current == out.cacheItems.length )) {
        $('.current').removeClass('current').addClass('old').next().removeClass('new').addClass('current');
        out.current += 1;
        //$('#container :nth-child('+(out.current) +')').removeClass('new').addClass('current');
        adjustRatio();
      }else{
        console.log('Already at the last image');
      }
    }

    out.prev = function () {
      if ( ! (out.current == 1 )) {
        $('.current').removeClass('current').addClass('new').prev().removeClass('old').addClass('current');
 ;
        out.current -= 1;
        adjustRatio();
      }else{
        console.log('Already at the first image');
      }
    }

    out.toggleStop = function () {
      out.stopped = !out.stopped;
    }
    return out;

  }
  var enabled = true;
  var sections = [];

  function isSupported() {
    return 'WebSocket' in window;
  }

  function genItem(imageData) {
    var next = $('<section><img src="' + imageData + '" /></section>');
    $('#container').append(next);
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
        console.log(msg.data);
        var data = msg.data;
        var imageData = JSON.parse(data);
        if (!cache){
          cache = createCache(5,imageData.data)
        }else {
          cache.update(imageData.data);
        }
      }
      socket.onclose = function () {
        console.log('conncection closed');
        setTimeout(1000, connect);
      };
    };
    
  }())

}(window, document));
