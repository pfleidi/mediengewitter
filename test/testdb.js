var Mongoose = require('mongoose').Mongoose,
testCase = require('nodeunit').testCase,
Step = require('step');

require('../models/image');
require('../models/cache');

var img1 = {
  url: 'http://foo.bar',
  tags: ['hurr', 'durr'],
  path: '/some/path'
};

var img2 = {
  url: 'http://hurr.durr',
  tags: ['hurr', 'durr', 'bar', 'baz'],
  path: '/some/other/path'
};

module.exports = testCase({ 

    setUp: function (callback) {
      this.db = Mongoose.connect('mongodb://localhost/testbucket');

      this.db.terminate = function (fn) {
        var self = this;
        this.db.dropDatabase(function () {
            fn();
          });
      };

      this.Cache = this.db.model('Cache');
      this.Image = this.db.model('Image');
      callback();
    },

    tearDown: function (callback) {
      this.db.terminate(callback);
    },

    testCache: function (test) {
      test.expect(4);
      var Cache = this.Cache,
      img = new this.Image(img1);


      img.save(function () {
          Cache.createEntry(img, function () {
              Cache.find().last(function (entry) {
                  test.strictEqual(entry.url, img.url);
                  test.deepEqual(entry.tags, img.tags);
                  test.strictEqual(entry.path, img.path);
                  test.strictEqual(entry._image.toHexString(), img._id.toHexString());
                  test.done();
                });
            });
        });

      setTimeout(1500, function () {
          test.done();
        });
    },

    testImage: function (test) {
      test.expect(6);
      var Image = this.Image;

      var testImg1 = new Image(img1);
      var testImg2 = new Image(img2);

      Step(
        function save1() {
          testImg1.save(this.parallel());
        },

        function save2() {
          testImg2.save(this.parallel());
        },

        function getRandom() {
          Image.getRandom(this);
        },

        function testRandom(random) {
          test.ok(random);
          test.ok(random.url);
          test.ok(random.path);
          test.ok(random.random);
          test.ok(random.tags);
          this();
        },

        function getAmount() {
          Image.find().all(this);
        },

        function testAmount(images) {
          test.strictEqual(images.length, 2); 
          this();
        },

        function finish() {
          test.done();
        }

      );

      setTimeout(1500, function () {
          test.done();
        });
    }

  });

