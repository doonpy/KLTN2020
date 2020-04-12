import { Database } from '../../services/database/database.index';
import { DetailUrl } from '../../services/detail-url/detail-url.index';
import { RawData } from '../../services/raw-data/raw-data.index';
import ConsoleLog from '../../util/console/console.log';
import { ConsoleConstant } from '../../util/console/console.constant';
import ChatBotTelegram from '../../services/chatbot/chatBotTelegram';
import { setProcessTimeout } from './child-process.util';

process.on(
    'message',
    async (): Promise<void> => {
        try {
            new ChatBotTelegram();
            await new Database.MongoDb().connect();

            await ChatBotTelegram.sendMessage(`<b>🤖[Clean data]🤖</b>\n📝 Start clean data...`);
            new ConsoleLog(ConsoleConstant.Type.INFO, `Start clean data...`).show();

            const aggregations: Array<object> = [
                {
                    $group: {
                        _id: '$url',
                        docList: {
                            $push: '$$ROOT',
                        },
                    },
                },
                {
                    $project: {
                        docList: 1,
                        docSize: {
                            $size: '$docList',
                        },
                    },
                },
                {
                    $match: {
                        docSize: {
                            $gt: 1,
                        },
                    },
                },
            ];
            const documents: Array<any> = await DetailUrl.Logic.aggregationQuery(aggregations);
            const detailUrlLogic: DetailUrl.Logic = new DetailUrl.Logic();
            const rawDataLogic: RawData.Logic = new RawData.Logic();

            setProcessTimeout('clean data', 60 * documents.length);

            for (const document of documents) {
                for (let i: number = 1; i < document.docList.length; i++) {
                    try {
                        await detailUrlLogic.delete(document.docList[i]._id);
                        new ConsoleLog(
                            ConsoleConstant.Type.INFO,
                            `Clean data - DID:${document.docList[i]._id})`
                        ).show();
                    } catch (error) {
                        new ConsoleLog(
                            ConsoleConstant.Type.ERROR,
                            `Delete DID: ${document.docList[i]._id}) failed. Error: ${error.rootCause || error.message}`
                        ).show();
                    }
                    if (document.docList[i].isExtracted) {
                        try {
                            const rawDataset: Array<RawData.DocumentInterface> = (
                                await rawDataLogic.getAll({ detailUrlId: document.docList[i]._id })
                            ).rawDataset;
                            for (const rawData of rawDataset) {
                                await rawDataLogic.delete(rawData._id);
                                new ConsoleLog(
                                    ConsoleConstant.Type.INFO,
                                    `Clean data - RID:${document.docList[i]._id})`
                                ).show();
                            }
                        } catch (error) {
                            new ConsoleLog(
                                ConsoleConstant.Type.ERROR,
                                `Delete raw data failed. Error: ${error.rootCause || error.message}`
                            ).show();
                        }
                    }
                }
            }
            await ChatBotTelegram.sendMessage(`<b>🤖[Clean data]🤖</b>\n✅ Clean data complete.`);
            new ConsoleLog(ConsoleConstant.Type.INFO, `Clean data complete.`).show();
            process.exit(0);
        } catch (error) {
            await ChatBotTelegram.sendMessage(
                `<b>🤖[Clean data]🤖</b>\n❌ Clean data failed.\nError:<code>${error.message}</code>`
            );
            new ConsoleLog(ConsoleConstant.Type.ERROR, `Clean data failed. Error: ${error.message}`).show();
            process.exit(1);
        }
    }
);
