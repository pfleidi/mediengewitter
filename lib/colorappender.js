var Style   = require('./colored').foreground,
    Sys     = require('sys');

var LOGLEVELS = {
  TRACE:    Style.blue, 
  DEBUG:    Style.green,
  INFO:     Style.yellow,
  WARNING:  Style.magenta,
  ERROR:    Style.red,
  FATAL:    Style.red,
};


var basicLayout = function(loggingEvent) {
  var timestampLevelAndCategory = '[' + loggingEvent.startTime.toFormattedString() + '] ';
  var level =  LOGLEVELS[loggingEvent.level.toString()](
    '[' + loggingEvent.level.toString() + '] '
  );

  timestampLevelAndCategory += level;
  timestampLevelAndCategory += loggingEvent.categoryName + ' - ';
  
  var output = timestampLevelAndCategory + loggingEvent.message;
  
  if (loggingEvent.exception) {
    output += '\n'
    output += timestampLevelAndCategory;
    if (loggingEvent.exception.stack) {
      output += loggingEvent.exception.stack;
    } else {
      output += loggingEvent.exception.name + ': '+loggingEvent.exception.message;
    }
  }
  return output;
};
    
exports.consoleAppender = function () {
  return function(loggingEvent) {
    Sys.puts(basicLayout(loggingEvent));
  };  
};

