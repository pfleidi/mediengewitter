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
  mod.wsServer =wsServer;
  mod.nicks = {};
  mod.dispatch = function dispatch (payload,con) {
    //TODO think of something cool to replace switch/case
    switch (payload.action) {
      case 'msg' :
        var msg = san.escape (payload.data);
        
        var nick = _getNickname(con.sessionId);

        var ret = { type : 'chat', 
                    payload : { action : "msg" ,
                                data : nick+msg // TODO pull nickname out of the message
                              }
                  }
        mod.wsServer.broadcast(JSON.stringify(ret));
        break;
      default :
        throw new Error('Action unknown'+ payload.action);
    }
  }
  function _getNickname (id){
    if ( mod.nicks[id] ) {
      return mod.nicks[id]+': ';
    } else {
      return 'anonym: ';
    }
  }
  return mod;
};
