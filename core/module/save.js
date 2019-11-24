// require("../../configs/database-config").init();
const schedule = require("node-schedule");
const REPEAT_TIME = "*/10 * * * * *";
const SAVE_AMOUNT = 15;
let queue = [];

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

exports.queue = queue;
