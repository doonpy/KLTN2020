const {Worker} = require("worker_threads");

class ExtractThread {
    constructor(params = {}) {
        this.modulePath = params.modulePath;
        this.socket = params.socket;
        this.status = false;
        this.worker = new Worker(this.modulePath);
        this.worker.on("online", () => (this.status = true));
        this._bindListenEvent();
        this.worker.postMessage({
            type: "extract-start",
            data: {catalogId: params.catalogId}
        });
        this.socket.emit("thread-info", {
            processId: process.pid,
            threadId: this.worker.threadId
        });
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

    pause() {
        this.worker.postMessage({type: "extract-pause"});
    }

    continue() {
        this.worker.postMessage({type: "extract-continue"});
    }

    terminate() {
        this.worker.postMessage({type: "extract-terminate"});
        this.status = false;
    }

    _bindListenEvent() {
        this.worker.on("message", message => {
            switch (message.type) {
                case "extract-success":
                    this.socket.emit("thread-message", {
                        type: "extract-success",
                        message: `${message.data.url} - <b>${message.data.statusCode}</b>`
                    });
                    break;
                case "extract-error":
                    this.socket.emit("thread-message", {
                        type: "extract-error",
                        message: `${message.data}`
                    });
                    break;
                case "extract-info":
                    if (message.data) {
                        this.socket.emit("thread-message", {
                            type: "extract-info",
                            message: message.data
                        });
                    }
                    break;
                case "extract-finish":
                    // finish
                    this.socket.emit("thread-message", {
                        type: "extract-info",
                        message: `Extract data completed. Click <a href="#">here</a> to view.`
                    });
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
}

module.exports = ExtractThread;
