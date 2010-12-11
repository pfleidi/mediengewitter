var Fs = require('fs');

exports.createCache = function (imageFile, log) {
  var images = Fs.readFileSync(imageFile, "utf8").split("\n");

  images = images.filter(function (img) {
      return (img.length > 4);
    });

  var imgCache = [];

  return {

    nextImage: function nextimage() {
      var image = images[Math.floor(images.length * Math.random())];

      if (imgCache.length > 4) {
        imgCache.shift();
      }
      imgCache.push(image);
      return image;
    },

    cache: function cache() {
      return imgCache.map(function (image) {
          return 'content/' + image;
        });
    }

  };

};
