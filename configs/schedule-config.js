const {
    Worker,
    isMainThread,
    parentPort,
    workerData
} = require("worker_threads");

exports.init = () => {
    // save schedule
    const saveModulePath = require.resolve("../core/module/save");
    const saveWorker = new Worker(saveModulePath);
    global.test = saveWorker;
};
