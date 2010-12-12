/*
 *
 * NextImage:
 * {
 *  type : 'cache'
 *  payload : {
 *    action : 'nextImage',
 *    data : 'link'  
 *   }
 * }
 *
 *
 * CACHE:
 * {
 *  type : 'cache'
 *  payload : {
 *    action : 'init',
 *    data : [
 *      'link1',
 *      'link2',
 *      'link3',
 *      'link4',
 *    ]
 *   }
 * }
 */

var Fs = require('fs');
var PATH = 'content/';
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
      return { type: 'cache', payload : { action :'nextImage', data: PATH + image}};
    },

    cache: function cache() {
      var cachedItems = imgCache.map(function (image) {
          return PATH + image;
        });
      return { type: 'cache', payload : { action :'init', data: cachedItems }};

    }

  };

};
