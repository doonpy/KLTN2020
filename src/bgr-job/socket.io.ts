import http from 'http';
import socketIo, { Server, Socket } from 'socket.io';
import { checkIsRunning, getMonitorContent, getTargetList, start } from './background-job';
import Timeout = NodeJS.Timeout;

/**
 * Initialize socket server
 */
export default (): void => {
    const httpServer: http.Server = http.createServer().listen(parseInt(process.env.SERVER_PORT || '6789'));
    const io: Server = socketIo(httpServer);

    io.on('connection', (socket: Socket) => {
        socket.on('start', (): void => {
            if (checkIsRunning()) {
                socket.emit('start', false);
                return;
            }

            start(true);
            socket.emit('start', true);
        });

        let monitorContentLoop: Timeout = setInterval((): void => {
            socket.emit('monitor-overview', getMonitorContent());
            socket.emit('monitor-target-list', getTargetList());
        }, 1000);

        socket.on('disconnect', (): void => {
            clearInterval(monitorContentLoop);
        });
    });
};
