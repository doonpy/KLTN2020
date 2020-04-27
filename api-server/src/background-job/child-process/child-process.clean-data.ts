import ConsoleLog from '../../util/console/console.log';
import ConsoleConstant from '../../util/console/console.constant';
import ChatBotTelegram from '../../util/chatbot/chatBotTelegram';
import DetailUrlLogic from '../../service/detail-url/detail-url.logic';
import RawDataLogic from '../../service/raw-data/raw-data.logic';
import DatabaseMongodb from '../../service/database/mongodb/database.mongodb';
import { RawDataDocumentModel } from '../../service/raw-data/raw-data.interface';
import { DetailUrlDocumentModel } from '../../service/detail-url/detail-url.interface';

type AggregationGroupDataResult = {
    _id: string;
    docList: DetailUrlDocumentModel[];
    docSize: number;
};

/**
 * Delete duplicate detail URL and raw data which scraped from that.
 */
const deleteDuplicateDetailUrl = async (): Promise<void> => {
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
                isNotSingle: {
                    $gt: [
                        {
                            $size: '$docList',
                        },
                        1,
                    ],
                },
            },
        },
        {
            $match: {
                isNotSingle: true,
            },
        },
    ];
    const detailUrlLogic: DetailUrlLogic = DetailUrlLogic.getInstance();
    const aggregationResult: AggregationGroupDataResult[] = ((await detailUrlLogic.aggregationQuery(
        aggregations
    )) as unknown) as AggregationGroupDataResult[];
    const rawDataLogic: RawDataLogic = RawDataLogic.getInstance();

    for (const item of aggregationResult) {
        for (let i = 1; i < item.docList.length; i++) {
            try {
                await detailUrlLogic.delete(item.docList[i]._id);
                new ConsoleLog(ConsoleConstant.Type.INFO, `Clean data -> DID:${item.docList[i]._id})`).show();
            } catch (error) {
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Clean data -> DID: ${item.docList[i]._id}) - Error: ${error.message}`
                ).show();
            }
            if (item.docList[i].isExtracted) {
                try {
                    const { documents }: { documents: RawDataDocumentModel[] } = await rawDataLogic.getAll(
                        undefined,
                        undefined,
                        {
                            detailUrlId: item.docList[i]._id,
                        }
                    );
                    for (const document of documents) {
                        await rawDataLogic.delete(document._id);
                        new ConsoleLog(ConsoleConstant.Type.INFO, `Clean data - RID:${item.docList[i]._id})`).show();
                    }
                } catch (error) {
                    new ConsoleLog(
                        ConsoleConstant.Type.ERROR,
                        `Clean data -> Raw data of DID: ${item.docList[i]._id} - Error: ${error.message}`
                    ).show();
                }
            }
        }
    }
};

process.on(
    'message',
    async (): Promise<void> => {
        const telegramChatBotInstance: ChatBotTelegram = ChatBotTelegram.getInstance();
        const mongoDbInstance: DatabaseMongodb = DatabaseMongodb.getInstance();
        try {
            await mongoDbInstance.connect();

            await telegramChatBotInstance.sendMessage(`<b>🤖[Clean data]🤖</b>\n📝 Start clean data...`);
            new ConsoleLog(ConsoleConstant.Type.INFO, `Start clean data...`).show();

            await deleteDuplicateDetailUrl();

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
