const { Worker } = require("worker_threads");

class ExtractThread {
  constructor(params = {}) {
    this.modulePath = params.modulePath;
    this.socket = params.socket;
    this.catalogId = params.catalogId;
    this.status = false;
    this.worker = new Worker(this.modulePath);
    this.threadId = this.worker.threadId;
    this.worker.on("online", () => (this.status = true));
    this._bindListenEvent();
    this.getInfo();
    this.start();
  }

  getWorker() {
    return this.worker;
  }

  getThreadId() {
    return this.worker.threadId;
  }

  getCatalogId() {
    return this.catalogId;
  }

  getSocketId() {
    return this.socket.id;
  }

  isOnline() {
    return this.status;
  }

  start() {
    this.worker.postMessage({
      type: "extract-start",
      data: { catalogId: this.catalogId }
    });
  }

  pause() {
    this.worker.postMessage({ type: "extract-pause" });
  }

  continue() {
    this.worker.postMessage({ type: "extract-continue" });
  }

  terminate() {
    this.worker.postMessage({ type: "extract-terminate" });
    this.status = false;
  }

  getInfo() {
    this.socket.emit("thread-info", {
      processId: process.pid,
      threadId: this.worker.threadId
    });
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
        case "extract-terminate":
          this.socket.emit("thread-message", {
            type: "extract-info",
            message: message.data
          });
          this.socket.disconnect();
          break;
        case "extract-finish":
          // finish
          this.socket.emit("thread-message", {
            type: "extract-info",
            message: `Extract data completed. Click <a href="#">here</a> to view.`
          });
          this.socket.disconnect();
          break;
      }
    });
    this.worker.on("exit", () => {
      console.log(
        `=> [W${process.pid} - ${require("moment")().format("L LTS")}] Thread ${
          this.threadId
        } was terminated`
      );
    });
  }
}

module.exports = ExtractThread;
