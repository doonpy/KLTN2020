let instance = null;
import io from "socket.io-client";

const SocketClient = {
  getInstance: function() {
    if (!instance) {
      instance = io({ transports: ["websocket"] });
    }
    return instance;
  },
  disconnect: function() {
    instance = null;
    return instance;
  },
  emitEvent: function(name, payload = {}) {
    instance.emit(name, payload);
  }
};
export default SocketClient;
