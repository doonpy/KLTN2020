const {
  Worker,
  isMainThread,
  parentPort,
  workerData
} = require("worker_threads");
let saveWorker = null;
let messagePort = null;

exports.SaveSchedule = class SaveSchedule {
  constructor() {
    // save scheduler
    if (!saveWorker) {
      saveWorker = new Worker(require.resolve("../core/module/save"));
      this._bindListenEvent();
    }
  }

  getSaveWorker() {
    return saveWorker;
  }

  addQueue(data) {
    messagePort.postMessage({type: "add-save-queue", data: data});
  }

  _bindListenEvent() {
    saveWorker.on("error", err => {
      console.log(
          `=> [W${process.pid} - ${require("moment")().format(
              "L LTS"
          )}] Save worker has error ${JSON.stringify(err)}`
      );
    });
    saveWorker.on("exit", () => {
      console.log(
          `=> [W${process.pid} - ${require("moment")().format(
              "L LTS"
          )}] Save worker exited`
      );
    });
    saveWorker.on("message", message => {
      if (message.type === "init") {
        messagePort = message.data;
      }
    });
  }
};
