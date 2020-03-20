import { BgrScrape } from './bgr-job/scrape/scrape.index';
import { Catalog } from './services/catalog/catalog.index';
import { BgrQueue } from './bgr-job/queue/queue.index';
import { Database } from './services/database/database.index';
import * as dotenv from 'dotenv';
import ChatBotTelegram from './services/chatbot/chatBotTelegram';
import ConsoleLog from './util/console/console.log';
import { ConsoleConstant } from './util/console/console.constant';
import http from 'http';
import socketIo, { Server, Socket } from 'socket.io';
import { Common } from './common/common.index';
import { v4 as uuidV4 } from 'uuid';
import ResponseStatusCode = Common.ResponseStatusCode;
import DateTime from './util/datetime/datetime';

dotenv.config();

const SCHEDULE_TIME_HOUR: number = parseInt(process.env.SCHEDULE_TIME_HOUR || '0'); // hour
const SCHEDULE_TIME_MINUTE: number = parseInt(process.env.SCHEDULE_TIME_MINUTE || '0'); // minute
const SCHEDULE_TIME_SECOND: number = parseInt(process.env.SCHEDULE_TIME_SECOND || '0'); // second
const SCHEDULE_TIME_DELAY_HOUR: number = parseInt(process.env.SCHEDULE_TIME_DELAY_HOUR || '0'); // hour
const SCHEDULE_TIME_DELAY_MINUTE: number = parseInt(process.env.SCHEDULE_TIME_DELAY_MINUTE || '0'); // minute
const SCHEDULE_TIME_DELAY_SECOND: number = parseInt(process.env.SCHEDULE_TIME_DELAY_SECOND || '0'); // second
const THREAD_AMOUNT: number = parseInt(process.env.THREAD_AMOUNT || '1');
let currentTargetOverview: Array<object> = [];
let threadOverview: Array<object> = [];
let jobQueueList: Array<BgrQueue.Job> = [];
let currentToken: string = '';

/**
 * Initialize job queue list
 */
const initJobQueueList = (): Array<BgrQueue.Job> => {
    let jobQueueList: Array<BgrQueue.Job> = [];
    for (let i: number = 0; i < THREAD_AMOUNT; i++) {
        let jobQueue: BgrQueue.Job = new BgrQueue.Job(i);
        jobQueueList.push(jobQueue);
    }

    return jobQueueList;
};

/**
 * Update monitor content
 */
const updateMonitorContent = (): void => {
    currentTargetOverview = [];
    threadOverview = jobQueueList.map((jobQueue, index): any => {
        if (jobQueue.isRunning) {
            currentTargetOverview[index] = jobQueue.getCurrentTask()
                ? jobQueue.getCurrentTask().getScrapedPageNumber()
                : [];
        }

        return {
            threadIndex: index,
            remainTasks: jobQueue.getRemainElements(),
            status: jobQueue.isRunning ? 'Running' : 'Stop',
            phase:
                jobQueue.isRunning && jobQueue.getCurrentTask()
                    ? jobQueue.getCurrentTask().getPhase() || 'N/A'
                    : 'N/A',
        };
    });
};

/**
 * Create response HTML
 */
const createResponseHtml = (): string => {
    return `
        <!DOCTYPE html>
            <html>
                <head>
                    <style>
                        table, th, td {
                            border: 1px solid black;
                        }
                    </style>
                    <script src="/socket.io/socket.io.js"></script>
                    <script src="https://code.jquery.com/jquery-1.11.1.js"></script>
                    <script>
                        $(function () {
                            let authToken = '';
                            let socket = io();
                            let username = prompt("Username:");
                            let password = prompt("Password:");
                            
                            socket.emit('auth', {username:username,password:password});
                            
                            socket.on('disconnect', () => {
                                alert("Disconnected!");
                                document.location=''
                            });
                            
                            socket.on('auth', ({isSuccess, token}) => {                          
                                if(isSuccess){
                                    authToken = token;
                                    setInterval(()=>{
                                        socket.emit('monitor', authToken);
                                    },1000)
                                } else {
                                    alert("Authentication failed!");
                                    document.location = '';
                                }
                            });
                            
                            socket.on('monitor', ({time, threadOverview, currentTargetOverview}) => {
                                let threadOverviewComponent = \`
                                    <h3>Thread Overview</h3>
                                    <table style="width:100%">
                                      <tr>
                                        <th>Thread index</th>
                                        <th>Remain tasks</th> 
                                        <th>Status</th>
                                        <th>Phase</th>
                                      </tr>\`;
                                let currentTargetOverviewComponent = \`
                                    <h3>Current Target Overview</h3>
                                    <table style="width:100%"><tr>\`;
                                    
                                    threadOverview.forEach((thread, index) => {
                                        threadOverviewComponent += \`
                                            <tr>
                                                <td>\${thread.threadIndex}</td>
                                                <td>\${thread.remainTasks}</td>
                                                <td>\${thread.status}</td>
                                                <td>\${thread.phase}</td>
                                            </tr>\`;
                                        currentTargetOverviewComponent+=\`<th>Thread \${index}</th>\`
                                });
                                threadOverviewComponent += \`</table>\`;
                                currentTargetOverviewComponent+=\`</tr><tr>\`;
                                
                                currentTargetOverview.forEach(thread => {
                                   currentTargetOverviewComponent+=\`<td><code>\${thread.join('<br>')}</code></td>\`;
                                });
                                currentTargetOverviewComponent+='</tr></table>';
                                
                                $('#time').text("UTC time: " + time);
                                $('#root').html(threadOverviewComponent + '<hr>' + currentTargetOverviewComponent);
                            })
                        });
                    </script>
                </head>
                <body>
                    <h3 id="time"></h3>
                    <div id="root"></div>
                </body>
            </html>`;
};

/**
 * Initialize HTTP monitor server
 */
const initHttpServer = (): void => {
    let httpServer: http.Server = http
        .createServer((req, res): void => {
            if (req.url === '/monitor' && req.method === 'GET') {
                res.writeHead(ResponseStatusCode.OK, {
                    'Content-Type': 'text/html; charset=utf-8',
                });
                res.write(createResponseHtml());
            } else {
                res.writeHead(ResponseStatusCode.FORBIDDEN);
            }

            res.end();
        })
        .listen(parseInt(process.env.SERVER_PORT || '6789'));

    let io: Server = socketIo(httpServer);
    io.on('connection', (socket: Socket) => {
        socket.on(
            'auth',
            ({ username, password }: { username: string; password: string }): void => {
                if (
                    username !== process.env.ADMIN_USERNAME ||
                    password !== process.env.ADMIN_PASSWORD
                ) {
                    socket.emit('auth', { isSuccess: false, token: null });
                } else {
                    currentToken = uuidV4();
                    socket.emit('auth', { isSuccess: true, token: currentToken });
                }
            }
        );
        socket.on('monitor', token => {
            if (token === currentToken) {
                updateMonitorContent();
                socket.emit('monitor', {
                    time: new Date().toUTCString(),
                    threadOverview: threadOverview,
                    currentTargetOverview: currentTargetOverview,
                });
            } else {
                socket.disconnect();
            }
        });
    });
};

/**
 * Script of background job.
 */
const script = async (): Promise<void> => {
    new ConsoleLog(ConsoleConstant.Type.INFO, `Background job is running...`).show();

    jobQueueList = initJobQueueList();
    let delayTime: number =
        (SCHEDULE_TIME_DELAY_SECOND || 1) *
        (SCHEDULE_TIME_DELAY_MINUTE ? SCHEDULE_TIME_DELAY_MINUTE * 60 : 1) *
        (SCHEDULE_TIME_DELAY_HOUR ? SCHEDULE_TIME_DELAY_HOUR * 3600 : 1);

    (async function start() {
        let expectTime: Date = new Date();
        expectTime.setUTCHours(SCHEDULE_TIME_HOUR);
        expectTime.setUTCMinutes(SCHEDULE_TIME_MINUTE);
        expectTime.setUTCSeconds(SCHEDULE_TIME_SECOND);
        if (!DateTime.isExactTime(expectTime, true)) {
            setTimeout(start, 1000);
            return;
        }

        let catalogIdList: Array<number> = (await new Catalog.Logic().getAll()).catalogs.map(
            catalog => {
                return catalog._id;
            }
        );

        for (const catalogId of catalogIdList) {
            if (!catalogId) {
                continue;
            }
            let scrapeDetailUrlJob: BgrScrape.DetailUrl = new BgrScrape.DetailUrl(catalogId);
            let threadIndex: number = catalogId % THREAD_AMOUNT;
            jobQueueList[threadIndex].pushElement(scrapeDetailUrlJob);
        }

        for (const jobQueue of jobQueueList) {
            if (!jobQueue.isRunning && jobQueue.getRemainElements() > 0) {
                jobQueue.start();
            }
        }
        setTimeout(start, 1000 * delayTime);
    })();
};

/**
 * Main
 */
new Database.MongoDb().connect().then(
    async (): Promise<void> => {
        new ChatBotTelegram();
        try {
            initHttpServer();
            await script();
        } catch (error) {
            ChatBotTelegram.sendMessage(
                `<b>🤖[Background Job]🤖 ❌ ERROR ❌</b>\n→ Message: <code>${error.message}</code>`
            );
            new ConsoleLog(ConsoleConstant.Type.ERROR, `Error: ${error.message}`).show();
        }
    }
);
