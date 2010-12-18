var Mongoose = require('mongoose').Mongoose;

Mongoose.model('Image', {

    properties: ['url', { 'tags': [] }, 'random', 'path', 'updated_at'],

    indexes: ['random'],

    cast: {
      updated_at: Date
    },

    methods: {
      save: function(fn){
        this.updated_at = new Date();
        this.random = Math.random();
        this.__super__(fn);
      }
    },

    static: {
      getRandom: function (callback) {
        var rand = Math.random(),
        self = this;


        this.find({random: { '$gte': rand }}).first(function (result) {
            if (result) {
              callback(result);
            } else {
              self.find({random: { '$lte': rand }}).first(function (result) {
                  callback(result);
                });
            }
          });
      }
    }

  });
