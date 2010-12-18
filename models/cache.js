var Mongoose = require('mongoose').Mongoose;

Mongoose.model('Cache', {

    properties: [ 'url', { 'tags': [] }, 'path', '_image' ],

    methods: {
      save: function (fn){
        this.updated_at = new Date();
        this.__super__(fn);
      },
    },

    static: {
      cache: function (amount, fn) {
        this.find().limit(amount).all(function (entries) {
            fn(entries);
          });
      },

      createEntry: function (image, fn) {
        var entry = new this(); 
        entry._image = image._id;
        entry.url = image.url;
        entry.tags = image.tags;
        entry.path = image.path;
        entry.save(fn);
      }

    }

  });
