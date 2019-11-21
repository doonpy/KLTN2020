var instance = null;
import io from "socket.io-client";

const SocketClient = {
    getInstance: function () {
        if (!instance) {
            instance = io();
        }
        return instance;
    },
    disconnect: function () {
        if (instance.connected) {
            instance.close();
            instance = null;
    }
    },
    emitEvent: function (name, data = {}) {
        instance.emit(name, {socketId: instance.id, message: data});
    }
};
export default SocketClient;
