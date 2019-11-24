const path = require("path");
const childProcess = require("child_process");

class Process {
    constructor(params) {
        this.modulePath = params.modulePath;
        this.executor = params.executor;
        this.pid = null;
        this.process = null;
    }

    getProcess() {
        return this.process;
    }

    getExecutor() {
        return this.executor;
    }

    getProcessId() {
        return this.pid;
    }

    isKilled() {
        return this.process.killed;
    }

    initProcess() {
        console.log(path.join(__dirname, this.modulePath));
        if (this.modulePath) {
            this.process = childProcess.fork(path.join(__dirname, this.modulePath));
            this.pid = this.process.pid;
        } else {
            throw new Error("Module path is null!");
        }
    }

    sendMessage(message) {
        this.process.send(message);
    }

    killProcess() {
        this.process.kill("SIGTERM");
    }
}

module.exports = Process;
