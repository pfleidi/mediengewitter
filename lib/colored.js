/*!
 * colored.js is a small lib to colorize shell output
 *
 * this is an adapted version of http://github.com/chrislloyd/colored.js
 */

(function () {

    /*
     * VT100 definitions (http://www.termsys.demon.co.uk/vtansi.htm)
     */

    var foreground = {
      black: 30,
      red: 31,
      green: 32,
      yellow: 33,
      blue: 34,
      magenta: 35,
      cyan: 36,
      white: 37
    },

    extras = {
      reset: 0,
      bold: 1,
      dim: 2,
      underline: 4,
      blink: 5,
      reverse: 7,
      hideen: 8
    },

    background = {
      black: 40,
      red: 41,
      green: 42,
      yellow: 43,
      blue: 44,
      magenta: 45,
      cyan: 46,
      white: 47
    };

    function esc(str) {
      return "\x1B[" + str + 'm';
    }

    function defineColoredFn(name, code) {
      if (process && process.isTTY && !process.isTTY()) {
        return function (str) {
          return (str || this);
        };
      } else {
        return function (str) {
          return esc(code) + (str || this) + esc(extras.reset);
        };
      }
    }

    function defineExports(namespace) {
      var exports = {};
      Object.keys(namespace).forEach(function (name) {
          exports[name] = defineColoredFn(name, namespace[name]);
        });
      return exports;
    }

    /* generate concrete exports */

    exports.foreground = defineExports(foreground);
    exports.background = defineExports(background);
    exports.extras = defineExports(extras);

}());
