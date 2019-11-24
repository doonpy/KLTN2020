const {
    Worker,
    isMainThread,
    parentPort,
    workerData
} = require("worker_threads");

class ExtractThread {
    constructor(params = {}) {
        this.modulePath = params.modulePath;
        this.socket = params.socket;
        this.worker = null;
        this.status = false;
    }

    getWorker() {
        return this.worker;
    }

    getThreadId() {
        return this.worker.threadId;
    }

    getSocketId() {
        return this.socket.id;
    }

    isOnline() {
        return this.status;
    }

    initInstance() {
        if (this.modulePath) {
            this.worker = new Worker(this.modulePath);
            this.worker.on("online", () => (this.status = true));
            this._bindListenEvent();
            this.socket.emit("thread-info", {
                processId: process.pid,
                threadId: this.worker.threadId
            });
        } else {
            throw new Error("Module path is null!");
        }
    }

    start(catalogId) {
        this.worker.postMessage({
            type: "start",
            data: {catalogId: catalogId}
        });
    }

    pause() {
        this.worker.postMessage({type: "pause"});
    }

    continue() {
        this.worker.postMessage({type: "continue"});
    }

    sendMessage(message) {
        this.worker.send(message);
    }

    _bindListenEvent() {
        this.worker.on("message", message => {
            switch (message.type) {
                case "success":
                    this.socket.emit("thread-message", {
                        type: "success",
                        message: `${message.data.url} - <b>${message.data.statusCode}</b>`
                    });
                    break;
                case "error":
                    this.socket.emit("thread-message", {
                        type: "error",
                        message: `${JSON.stringify(message.data)}`
                    });
                    break;
                case "info":
                    if (message.data) {
                        this.socket.emit("thread-message", {
                            type: "info",
                            message: message.data
                        });
                    }
                    break;
                default:
                    break;
            }
        });

        this.worker.on("exit", () => {
            this.socket.emit("thread-message", {
                type: "info",
                message: `Thread was terminated...`
            });
        });
    }

    terminate() {
        this.worker.terminate();
        this.status = false;
    }
}

module.exports = ExtractThread;
