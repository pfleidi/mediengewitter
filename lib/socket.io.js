exports.Listener = require('./socket.io/listener');
exports.listen = function(server, options){
	return new exports.Listener(server, options);
};
