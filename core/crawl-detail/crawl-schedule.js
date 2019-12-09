require("../../configs/database-config").init();
const Catalog = require("../../models/catalog-model");
const { Worker } = require("worker_threads");

const MAX_WORKER_EXECUTING = 1;
const REPEAT_TIME = {
  CRAWL: 60 * 60, //seconds
  SAVE: 10 //seconds
};

(function crawlLoop() {
  Catalog.find().populate("hostId").exec((err, catalogs) => {
    if (err) {
      console.log(
        `=> [M${process.pid} - ${require("moment")().format(
          "L LTS"
        )}] Compile error: ${err.message}`
      );
      setTimeout(crawlLoop, 1000 * REPEAT_TIME.CRAWL);
    }
    let workerCount = 0;
    let loop = setInterval(() => {
      if (catalogs.length === 0) {
        clearInterval(loop);
        return;
      }
      if (workerCount < MAX_WORKER_EXECUTING) {
        let catalog = catalogs.shift();
        const worker = new Worker(require.resolve("./crawl-thread"), {
          workerData: JSON.stringify(catalog)
        });
        workerCount++;
        worker.on("error", err => {
          console.log(
            `=> [M${process.pid} - ${require("moment")().format(
              "L LTS"
            )}] Crawler child worker error: ${err.message}`
          );
        });

        worker.on("exit", code => {
          if (code !== 0)
            console.log(
              `=> [M${process.pid} - ${require("moment")().format(
                "L LTS"
              )}] Crawler child worker stopped with exit code ${code}`
            );
        });
      }
    }, 0);
  });
})();
