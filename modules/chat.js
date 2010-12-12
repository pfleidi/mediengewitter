/*
 * {
 *  type : 'chat',
 *  payload : {
 *    action : 'msg',
 *    data : 'text'
 *    }
 *  }
 */

var san = require ('sanitizer');

exports.create = function create (log,wsServer) {
  var mod = {};
  mod.nicks = {};
  mod.dispatch = function dispatch (payload,con) {
    //TODO think of something cool to replace switch/case
    switch (payload.action) {
      case 'msg' :
        var msg = san.escape (payload.data);

        var nick = nicks[con.sessionId] + ':';

        var ret = { type : 'chat', 
                    payload : { action : "msg" ,
                                data : nick+msg // TODO pull nickname out of the message
                              }
                  }
        wsServer.broadcast(JSON.stringify(ret));
        break;
      default :
        throw new Error('Action unknown'+ payload.action);
    }
  }
};
