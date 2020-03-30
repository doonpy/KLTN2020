import socketClient from 'socket.io-client';

let socket: SocketIOClient.Socket;

export default class SocketClient {
    /**
     * @return SocketIOClient.Socket socket
     */
    public static getInstance(): SocketIOClient.Socket {
        if (!socket) {
            socket = socketClient.connect('http://pk2020.tk:6789');
            socket.on('reconnect_error', (reason: string): void => {
                alert('Connect server failed! - ' + reason);
                document.location.href = '';
            });
        }
        return socket;
    }
}
