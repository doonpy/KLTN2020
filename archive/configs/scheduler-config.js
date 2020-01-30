const {Worker} = require("worker_threads");
const childProcess = require("child_process");

/**
 * Start scheduler
 */
(function startScheduler() {
  // Extract data worker
  let extractWorker = childProcess.fork(
      require.resolve("../core/extract/extract-schedule")
  );
  extractWorker.on("exit", code => {
    console.log(
        `=> [M${process.pid} - ${require("moment")().format(
            "L LTS"
        )}] Extract data worker terminated - (code: ${code})`
    );
    extractWorker = childProcess.fork(
        require.resolve("../core/extract/extract-schedule")
    );
  });
  console.log(
      `=> [W${process.pid} - ${require("moment")().format(
          "L LTS"
      )}] Extract worker ${extractWorker.pid} started`
  );

  // Compile data worker
  let compileWorker = childProcess.fork(
      require.resolve("../core/compile-data/compile-schedule")
  );
  compileWorker.on("exit", code => {
    console.log(
        `=> [M${process.pid} - ${require("moment")().format(
            "L LTS"
        )}] Compile data worker terminated - (code: ${code})`
    );
    compileWorker = childProcess.fork(
        require.resolve("../core/extract/extract-schedule")
    );
  });
  console.log(
      `=> [W${process.pid} - ${require("moment")().format(
          "L LTS"
      )}] Compile worker ${compileWorker.pid} started`
  );

  // Crawl detail URL  worker
  let crawlDetailWorker = childProcess.fork(
      require.resolve("../core/crawl-detail/crawl-schedule")
  );
  crawlDetailWorker.on("exit", code => {
    console.log(
        `=> [M${process.pid} - ${require("moment")().format(
            "L LTS"
        )}] Crawl detail URL  worker terminated - (code: ${code})`
    );
    crawlDetailWorker = childProcess.fork(
        require.resolve("../core/crawl-detail/crawl-schedule")
    );
  });
  console.log(
      `=> [W${process.pid} - ${require("moment")().format(
          "L LTS"
      )}] Crawl detail URL worker ${crawlDetailWorker.pid} started`
  );
})();
