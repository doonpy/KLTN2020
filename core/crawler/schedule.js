/* eslint-disable no-array-constructor */
/* eslint-disable max-len */
/* eslint-disable camelcase */
const path = require('path');
const childProcess = require('child_process');
const numCPUs = require('os').cpus().length;
const MODUlE_PATH = path.join(__dirname, `./main`);
const REPEAT_TIME_DAY = 1000 * 3600 * 24;
const crawlProcessList = new Array();

// fork child process
const childProcessCrawler = (urlList, options) => {
  const cloneUrlList = [...urlList];
  console.log(cloneUrlList);

  const loopUrl = setInterval(() => {
    // prevent duplicate process
    if (crawlProcessList.length >= numCPUs) return;

    if (crawlProcessList.find((p) => p.url === cloneUrlList[0]) !== undefined) {
      cloneUrlList.shift();
      return;
    }
    const forked = childProcess.fork(MODUlE_PATH);
    console.log(
        `=> Fork child process ${forked.pid} for crawl "${cloneUrlList[0]}"`
    );

    forked.send({url: cloneUrlList[0], options: options});
    crawlProcessList.push({
      pid: forked.pid,
      url: cloneUrlList[0],
    });
    cloneUrlList.shift();

    forked.on('message', (data) => {
      if (data.type === false) {
        console.log(`=> [PID:${forked.pid}] ERR: ${JSON.stringify(data)}`);
      }
      forked.kill('SIGTERM');
      crawlProcessList.splice(
          crawlProcessList.findIndex((p) => {
            p.pid === forked.pid;
          }),
          1
      );
      console.log(
          `=> Kill child process ${forked.pid} - status: ${forked.killed}`
      );
    });

    if (cloneUrlList.length === 0) {
      clearInterval(loopUrl);
    }
  }, 0); // 0 for callback exec immediately
};

exports.main = (urlList, repeatTime, options) => {
  console.log(`=> Num of CPUs: ${numCPUs}`);
  childProcessCrawler(urlList, options);
  setInterval(() => {
    childProcessCrawler(urlList, options);
  }, repeatTime * REPEAT_TIME_DAY);
};
