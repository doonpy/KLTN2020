require("../../configs/database-config").init();
const Definition = require("../../models/definition-model");
const ExtractLog = require("../../models/extract-log-model");
const DetailUrl = require("../../models/detail-url-model");
const {Worker} = require("worker_threads");
const async = require("async");
const nodeSchedule = require("node-schedule");
const timeHelper = require("../../helper/time");

let curDate = new Date();
curDate.setDate(curDate.getDate() - 7);
const DATE_LIMIT = new Date(curDate); // 1 week from present
const MAX_URL_TO_GET = 1000;
const MAX_REQUEST_RETRIES = 3;
const REPEAT_TIME = {
  EXTRACT: 60 * 60, //seconds
  SAVE: 30 //seconds
};
const MAX_WORKER_EXECUTING = 3;
const JOB_REPEAT_TIME = "0 0 */1 * * * "; //Execute every 1 hours

nodeSchedule.scheduleJob(JOB_REPEAT_TIME, main);

// main();
/**
 * Main function
 */
function main() {
  const hrStart = process.hrtime();
  async.parallel(
    {
      definitions: function(callback) {
        Definition.find().exec(callback);
      },
      detailUrls: function(callback) {
        DetailUrl.aggregate([
          {
            $match: {
              cTime: { $gte: DATE_LIMIT }
            }
          },
          {
            $match: {
              isExtracted: false
            }
          },
          {
            $limit: MAX_URL_TO_GET
          },
          {
            $match: {
              requestRetries: {
                $lt: MAX_REQUEST_RETRIES
              }
            }
          },
          {
            $lookup: {
              from: "definitions",
              localField: "catalogId",
              foreignField: "catalogId",
              as: "definition"
            }
          },
          {
            $project: {
              url: 1,
              isExtracted: 1,
              catalogId: 1,
              cTime: 1,
              eTime: 1,
              requestRetries: 1,
              isDefined: {
                $gt: [
                  {
                    $size: "$definition"
                  },
                  0
                ]
              }
            }
          },
          {
            $match: {
              isDefined: true
            }
          }
        ]).exec(callback);
      }
    },
    (err, data) => {
      if (err) {
        console.log(
          `=> [M${process.pid} - ${require("moment")().format(
            "L LTS"
          )}] Extract error: ${err.message}`
        );
        return;
      }

      let {definitions, detailUrls} = data;
      let urls = [];
      let requestAmount = detailUrls.length;
      let successAmount = 0;
      let failedAmount = 0;

      if (detailUrls.length === 0) {
        return;
      }

      let detailUrlGroupedByDefinition = groupDetailUrlByDefinition(
          definitions,
          detailUrls
      );

      let workerCount = 0;
      let workerLoop = setInterval(() => {
        if (detailUrlGroupedByDefinition.length === 0) {
          clearInterval(workerLoop);
          return;
        }

        if (workerCount < MAX_WORKER_EXECUTING) {
          let detailUrlGroup = detailUrlGroupedByDefinition.shift();
          const worker = new Worker(require.resolve("./extract-thread"), {
            workerData: JSON.stringify(detailUrlGroup)
          });
          workerCount++;

          worker.on("message", message => {
            let data = JSON.parse(message);
            worker.terminate();
            successAmount += data.successAmount;
            failedAmount += failedAmount;
            urls.concat(data.urls);
            workerCount--;

            if (workerCount === 0) {
              const hrEnd = process.hrtime(hrStart)[0];
              new ExtractLog({
                urls: urls,
                requestAmount: requestAmount,
                successAmount: successAmount,
                failedAmount: failedAmount,
                executeTime: hrEnd
              }).save(err => {
                if (err) {
                  console.log(
                      `=> [M${process.pid} - ${require("moment")().format(
                          "L LTS"
                      )}] Extract log > Save failed: ${err.message}`
                  );
                } else {
                  console.log(
                      `=> [M${process.pid} - ${require("moment")().format(
                          "L LTS"
                      )}] Extract worker was ran within ${timeHelper.secondsToHms(
                          hrEnd
                      )}! Next time at ${require("moment")()
                          .add(REPEAT_TIME.EXTRACT, "seconds")
                          .format("L LTS")}`
                  );
                }
              });
            }
            // else {
            //   catalogs.push(data.catalog);
            // }
          });

          worker.on("error", err => {
            console.log(
                `=> [M${process.pid} - ${require("moment")().format(
                    "L LTS"
                )}] Extract child worker error: ${err.message}`
            );
            workerCount--;
          });

          worker.on("exit", code => {
            if (code !== 0) {
              console.log(
                  `=> [M${process.pid} - ${require("moment")().format(
                      "L LTS"
                  )}] Extract child worker stopped with exit code ${code}`
              );
            }
          });
        }
      }, 0);
    }
  );
}

/**
 * Group detail url by definition
 * @param definitions
 * @param detailUrls
 * @returns {[]}
 */
function groupDetailUrlByDefinition(definitions, detailUrls) {
  let result = [];
  definitions.forEach(definition => {
    let objectList = [];
    detailUrls = detailUrls.filter(d => {
      if (d.catalogId.toString() === definition.catalogId.toString()) {
        objectList.push(d);
        return false;
      }
      return true;
    });
    result.push({
      definition: definition,
      detailUrls: objectList
    });
  });

  return result;
}
