require("../../configs/database-config").init();
const Catalog = require("../../models/catalog-model");
const { Worker } = require("worker_threads");
const nodeSchedule = require("node-schedule");

const MAX_WORKER_EXECUTING = 2;
const REPEAT_TIME = {
  CRAWL: "0 0 */1 * * * *" //Execute each 1 hours
};

nodeSchedule.scheduleJob(REPEAT_TIME.CRAWL, main);

/**
 * Main function
 */
function main() {
  Catalog.find()
    .populate("hostId")
    .exec((err, catalogs) => {
      if (err) {
        console.log(
          `=> [M${process.pid} - ${require("moment")().format(
            "L LTS"
          )}] Compile error: ${err.message}`
        );
        return;
      }
      let workerCount = 0;
      let workerLoop = setInterval(() => {
        if (catalogs.length === 0) {
          clearInterval(workerLoop);
          return;
        }
        if (workerCount < MAX_WORKER_EXECUTING) {
          let catalog = catalogs.shift();
          const worker = new Worker(require.resolve("./crawl-thread"), {
            workerData: JSON.stringify(catalog)
          });
          workerCount++;
          worker.on("message", message => {
            let data = JSON.parse(message);
            if (data.status) {
              worker.terminate();
              workerCount--;
            }
            // else {
            //   catalogs.push(data.catalog);
            // }
          });

          worker.on("error", err => {
            console.log(
              `=> [M${process.pid} - ${require("moment")().format(
                "L LTS"
              )}] Crawler child worker error: ${err.message}`
            );
            workerCount--;
          });

          worker.on("exit", code => {
            if (code !== 0) {
              console.log(
                `=> [M${process.pid} - ${require("moment")().format(
                  "L LTS"
                )}] Crawler child worker stopped with exit code ${code}`
              );
            }
            workerCount--;
          });
        }
      }, 0);
    });
}
