const { Worker } = require("worker_threads");

/**
 * Start scheduler
 */
(function startScheduler() {
  // Extract data worker
  // let extractWorker = new Worker(
  //   require.resolve("../core/extract/extract-schedule")
  // );
  // extractWorker.on("exit", () => {
  //   console.log(
  //     `=> [M${process.pid} - ${require("moment")().format(
  //       "L LTS"
  //     )}] Extract data worker terminated.`
  //   );
  //   extractWorker = new Worker(
  //     require.resolve("../core/extract/extract-schedule")
  //   );
  // });
  //
  // // Compile data worker
  // let compileWorker = new Worker(
  //   require.resolve("../core/compile-data/compile-schedule")
  // );
  // compileWorker.on("exit", () => {
  //   console.log(
  //     `=> [M${process.pid} - ${require("moment")().format(
  //       "L LTS"
  //     )}] Compile data worker terminated.`
  //   );
  //   compileWorker = new Worker(
  //     require.resolve("../core/extract/extract-schedule")
  //   );
  // });
  // console.log(
  //   `=> [W${process.pid} - ${require("moment")().format("L LTS")}] Scheduler ${
  //     process.pid
  //   } started`
  // );

  // Crawl detail URL  worker
  let crawlDetailWorker = new Worker(
    require.resolve("../core/crawl-detail/crawl-schedule")
  );
  crawlDetailWorker.on("exit", () => {
    console.log(
      `=> [M${process.pid} - ${require("moment")().format(
        "L LTS"
      )}] Crawl detail URL  worker terminated.`
    );
    crawlDetailWorker = new Worker(
      require.resolve("../core/crawl-detail/crawl-schedule")
    );
  });
  console.log(
    `=> [W${process.pid} - ${require("moment")().format(
      "L LTS"
    )}] Crawl detail URL worker ${process.pid} started`
  );
})();
