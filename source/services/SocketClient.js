var instance = null;

const SocketClient = {
    initInstance:function(){
      if(!instance){
          instance=io();
      }
    },
    getInstance:function(){
        return instance;
    }
}
export default SocketClient;