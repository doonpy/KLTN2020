const path = require("path");
const childProcess = require("child_process");
const numCPUs = require("os").cpus().length;
const cheerio = require("cheerio");
const MODUlE_PATH = path.join(__dirname, `./request`);
const storageMethods = require("./storage-methods");
const crypto = require("crypto");
const moment = require("moment");
const CrawHistory = require("../models/crawl-history-model");

var numChildProcess = 0;

const forkProcess = urlList => {
    return new Promise((resolve, reject) => {
        // fork child process
        const forked = childProcess.fork(MODUlE_PATH);
        numChildProcess++;
        console.log(
            `=> Fork child process ${forked.pid} for crawl "${urlList[0]}"`
        );

        //set message to child process, request start crawl
        forked.send({url: urlList[0]});

        //listen result from child process
        forked.on("message", data => {
            // failed
            if (data.err) {
                reject(data);
            } else {
                resolve(data.response);
            }

            // kill child process
            forked.kill("SIGTERM");
            console.log(
                `=> Kill child process ${forked.pid} - status: ${forked.killed}`
            );
            numChildProcess--;
        });

        // remove the first url.
        urlList.shift();
    });
};

const formatBody = $ => {
    $("head").append(
        `<style>
      .crawler-border-solid-selected { border: 2px solid #dee2e6 !important }
      .crawler-border-color-selected { border-color: #28a745!important }
      .crawler-border-solid-hover { border: 2px solid #dee2e6 !important }
      .crawler-border-color-hover { border-color: #dc3545!important }
    </style>`
    );

    // $("link, script, img").each(function() {
    //   let tagName = $(this).get(0).name;
    //   switch (tagName) {
    //     case "link":
    //       if (!/http(s)?:\/\//g.test(href))
    //         $(this).attr("href", hostname + $(this).attr("href"));
    //     case "script":
    //       if (!/http(s)?:\/\//g.test(src))
    //         $(this).attr("src", hostname + $(this).attr("src"));
    //     case "img":
    //       if (!/http(s)?:\/\//g.test(src))
    //         $(this).attr("src", `http${hostname$}${$(this).attr("src")}`);
    //   }
    // });
};

const saveCrawlHistory = (hostname, url, filename) => {
    CrawHistory.findOne({url: url}, (err, found) => {
        if (err) throw err;
        if (!found) {
            let crawlHistory = new CrawHistory({
                hostname: hostname,
                url: url,
                filename: filename,
                lastUpdate: moment(new Date()).valueOf()
            });

            crawlHistory.save();
        } else {
            found.filename = filename;
            found.lastUpdate = moment(new Date()).valueOf();

            found.save();
        }
    });
};

const saveResponseBody = response => {
    const $ = cheerio.load(response.body);

    const secret = "poonne";
    const title = crypto
        .createHmac("md5", secret)
        .update(response.request.uri.href)
        .digest("hex");
    const hostname = response.request.uri.host;
    const url = response.request.uri.href;

    formatBody($);
    storageMethods.createFile(hostname, `${title}.html`, $.root().html());
    saveCrawlHistory(hostname, url, title);
};

const getHostHasDefined = () => {
    return new Promise((resolve, reject) => {
        const DefData = require("../models/definition-model");
        DefData.find({}, "host", (err, hosts) => {
            if (err) reject(err);
            if (!hosts) resolve([]);
            else resolve(hosts);
        });
    });
};

const main = urlList => {
    getHostHasDefined()
        .then(hosts => {
            hosts = hosts.map(h => h.host);
            let loop = setInterval(() => {
                if (urlList.length === 0) {
                    clearInterval(loop);
                    return;
                }
                if (numChildProcess < numCPUs) {
                    forkProcess(urlList)
                        .then(response => {
                            let isHostDefined = hosts.find(
                                h => h === response.request.uri.host
                            );
                            let host = response.request.uri.host;
                            let url = response.request.uri.href;
                            if (isHostDefined) {
                                require("./extract").main(host, url, response.body);
                                global.io.emit("success", {
                                    url: url,
                                    host: host,
                                    isHostDefined: isHostDefined,
                                    statusCode: response.statusCode
                                });
                            } else {
                                saveResponseBody(response);
                                global.io.emit("success", {
                                    url: url,
                                    host: host,
                                    isHostDefined: isHostDefined,
                                    statusCode: response.statusCode
                                });
                            }
                        })
                        .catch(err => {
                            global.io.emit("failed", err);
                        });
                }
            }, 0);
        })
        .catch(err => {
            throw err;
        });
};

exports.main = main;
