import DetailUrl from '../../services/detail-url/detail-url.index';
import RawData from '../../services/raw-data/raw-data.index';
import ConsoleLog from '../../util/console/console.log';
import ConsoleConstant from '../../util/console/console.constant';
import ChatBotTelegram from '../../util/chatbot/chatBotTelegram';
import DetailUrlLogic from '../../services/detail-url/detail-url.logic';
import RawDataLogic from '../../services/raw-data/raw-data.logic';
import DatabaseMongodb from '../../services/database/mongodb/database.mongodb';

process.on(
    'message',
    async (): Promise<void> => {
        const telegramChatBotInstance: ChatBotTelegram = ChatBotTelegram.getInstance();
        const mongoDbInstance: DatabaseMongodb = DatabaseMongodb.getInstance();
        try {
            await mongoDbInstance.connect();

            await telegramChatBotInstance.sendMessage(`<b>🤖[Clean data]🤖</b>\n📝 Start clean data...`);
            new ConsoleLog(ConsoleConstant.Type.INFO, `Start clean data...`).show();

            const aggregations: object[] = [
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const documents: any[] = await DetailUrl.Logic.aggregationQuery(aggregations);
            const detailUrlLogic: DetailUrlLogic = new DetailUrl.Logic();
            const rawDataLogic: RawDataLogic = new RawData.Logic();

            for (const document of documents) {
                for (let i = 1; i < document.docList.length; i++) {
                    try {
                        await detailUrlLogic.delete(document.docList[i]._id);
                        new ConsoleLog(
                            ConsoleConstant.Type.INFO,
                            `Clean data - DID:${document.docList[i]._id})`
                        ).show();
                    } catch (error) {
                        new ConsoleLog(
                            ConsoleConstant.Type.ERROR,
                            `Delete DID: ${document.docList[i]._id}) failed. Error: ${error.cause || error.message}`
                        ).show();
                    }
                    if (document.docList[i].isExtracted) {
                        try {
                            const { rawDataset } = await rawDataLogic.getAll({
                                detailUrlId: document.docList[i]._id,
                            });
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
                                `Delete raw data failed. Error: ${error.cause || error.message}`
                            ).show();
                        }
                    }
                }
            }
            await telegramChatBotInstance.sendMessage(`<b>🤖[Clean data]🤖</b>\n✅ Clean data complete.`);
            new ConsoleLog(ConsoleConstant.Type.INFO, `Clean data complete.`).show();
            process.exit(0);
        } catch (error) {
            await telegramChatBotInstance.sendMessage(
                `<b>🤖[Clean data]🤖</b>\n❌ Clean data failed.\nError:<code>${error.message}</code>`
            );
            new ConsoleLog(ConsoleConstant.Type.ERROR, `Clean data failed. Error: ${error.message}`).show();
            process.exit(1);
        }
    }
);
