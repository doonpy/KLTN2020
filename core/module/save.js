// require("../../configs/database-config").init();
const {parentPort, MessageChannel} = require("worker_threads");
const schedule = require("node-schedule");
const REPEAT_TIME = "*/10 * * * * *";
const SAVE_AMOUNT = 15;
let queue = [];

const {port1, port2} = new MessageChannel();
port1.postMessage({type: "init", data: port1});

schedule.scheduleJob(REPEAT_TIME, function () {
  if (queue.length === 0) {
    return;
  }

  let data;

  if (queue.length < SAVE_AMOUNT) {
    data = queue.splice(0, queue.length);
  } else {
    data = queue.splice(0, SAVE_AMOUNT);
  }

  data.forEach(d => {
    d.save(err => {
      if (err) {
        console.log(`=> [${process.pid}] ${err.message}`);
      }
    });
  });
  console.log(
      `=> [W${process.pid} - ${require("moment")().format(
          "L LTS"
      )}] Save schedule is running. The number is left in the queue is ${
          queue.length
      }`
  );
});

port1.on("message", message => {
  if (message.type === "add-save-queue") {
    console.log("here", JSON.stringify(message.data));
    queue.push(message.data);
  }
});
