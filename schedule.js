const childProcess = require("child_process");
const numCPUs = require("os").cpus().length;
const MODUlE_PATH = `./crawler`;
const REPEAT_TIME_DAY = 1000 * 3600 * 24;
let crawlProcessList = new Array();

const childProcessCrawler = urlList => {
  let cloneUrlList = [...urlList];

  const loopUrl = setInterval(() => {
    //prevent duplicate process

    if (
      crawlProcessList.length < numCPUs - 1 &&
      crawlProcessList.find(p => p.url === cloneUrlList[0]) === undefined
    ) {
      let forked = childProcess.fork(MODUlE_PATH);
      console.log(
        `=> Fork child process ${forked.pid} for crawl "${cloneUrlList[0]}"`
      );

      forked.send({ url: cloneUrlList[0] });
      crawlProcessList.push({
        pid: forked.pid,
        url: cloneUrlList[0]
      });
      cloneUrlList.shift();

      forked.on("message", data => {
        if (data.type === false) {
          console.log(`=> [PID:${forked.pid}] ERR: ${data.err}`);
        }
        forked.kill("SIGTERM");
        crawlProcessList.splice(
          crawlProcessList.findIndex(p => {
            p.pid === forked.pid;
          }),
          1
        );
        console.log(
          `=> Kill child process ${forked.pid} - status: ${forked.killed}`
        );
      });
    } else {
      cloneUrlList.shift();
    }
    if (cloneUrlList.length === 0) {
      clearInterval(loopUrl);
    }
  }, 0); //0 for callback exec immediately
};

module.exports.main = (urlList, repeatTime) => {
  childProcessCrawler(urlList);
  setInterval(() => {
    childProcessCrawler(urlList);
  }, repeatTime * REPEAT_TIME_DAY);
};
