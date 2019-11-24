let instance = null;
import io from "socket.io-client";

const SocketClient = {
  getInstance: function () {
    if (!instance) {
      instance = io("http://localhost:3000", {transports: ["websocket"]});
    }
    return instance;
  },
  disconnect: function () {
    if (instance.connected) {
      instance.close();
      instance = null;
    }
  },
  emitEvent: function (name, payload = {}) {
    instance.emit(name, payload);
  }
};
export default SocketClient;
