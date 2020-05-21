import ConsoleLog from '../../util/console/console.log';
import ConsoleConstant from '../../util/console/console.constant';
import ChatBotTelegram from '../../util/chatbot/chatBotTelegram';
import DetailUrlLogic from '../../service/detail-url/detail-url.logic';
import RawDataLogic from '../../service/raw-data/raw-data.logic';
import DatabaseMongodb from '../../service/database/mongodb/database.mongodb';
import { RawDataDocumentModel } from '../../service/raw-data/raw-data.interface';
import { DetailUrlDocumentModel } from '../../service/detail-url/detail-url.interface';
import DateTime from '../../util/datetime/datetime';
import VisualizationDistrictModel from '../../service/visualization/district/visualization.district.model';
import VisualizationWardModel from '../../service/visualization/ward/visualization.ward.model';
import { CleanDataConstant } from './child-process.constant';

type AggregationGroupDataResult = {
    _id: string;
    docList: DetailUrlDocumentModel[];
    docSize: number;
};

const PROCESS_LIMIT = 10;
let script: AsyncGenerator;

/**
 * Delete duplicate detail URL and raw data which scraped from that.
 */
const deleteDuplicateData = async (): Promise<void> => {
    const detailUrlLogic: DetailUrlLogic = DetailUrlLogic.getInstance();
    const aggregationResult: AggregationGroupDataResult[] = ((await detailUrlLogic.aggregationQuery(
        CleanDataConstant.DUPLICATE_DETAIL_URL_AGGREGATIONS
    )) as unknown) as AggregationGroupDataResult[];
    const rawDataLogic: RawDataLogic = RawDataLogic.getInstance();
    let processCount = 0;

    const loop: NodeJS.Timeout = setInterval(async (): Promise<void> => {
        if (aggregationResult.length === 0) {
            clearInterval(loop);
            new ConsoleLog(ConsoleConstant.Type.INFO, `Clean data - Delete duplicate - Complete`).show();
            script.next();
            return;
        }

        if (processCount > PROCESS_LIMIT) {
            return;
        }

        const item: AggregationGroupDataResult | undefined = aggregationResult.shift();
        if (!item) {
            return;
        }
        processCount += 1;

        item.docList.shift();
        for (const doc of item.docList) {
            try {
                await detailUrlLogic.delete(doc._id);
                new ConsoleLog(ConsoleConstant.Type.INFO, `Clean data - Duplicate data -> DID:${doc._id}`).show();
            } catch (error) {
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Clean data - Duplicate data -> DID: ${doc._id}) - Error: ${error.message}`
                ).show();
            }

            if (doc.isExtracted) {
                try {
                    const { documents }: { documents: RawDataDocumentModel[] } = await rawDataLogic.getAll(
                        undefined,
                        undefined,
                        {
                            detailUrlId: doc._id,
                        }
                    );
                    for (const document of documents) {
                        await rawDataLogic.delete(document._id);
                        new ConsoleLog(
                            ConsoleConstant.Type.INFO,
                            `Clean data - Duplicate data -> RID:${doc._id}`
                        ).show();
                    }
                } catch (error) {
                    new ConsoleLog(
                        ConsoleConstant.Type.ERROR,
                        `Clean data - Duplicate data -> Raw data of DID: ${doc._id} - Error: ${error.message}`
                    ).show();
                }
            }
        }

        processCount -= 1;
    }, 0);
};

/**
 * Delete data which have address not contain district or ward
 */
const deleteInvalidAddressData = async (): Promise<void> => {
    const rawDataLogic = RawDataLogic.getInstance();
    const limit = 1000;
    const districtPattern: string = (await VisualizationDistrictModel.find())
        .map((district) => district.name)
        .join('|');
    const wards: string[] = (await VisualizationWardModel.find()).map((ward) => ward.name);
    const wardPattern: string = wards.filter((ward, index) => wards.lastIndexOf(ward) === index).join('|');
    const addressPattern = new RegExp(`(?:${wardPattern}).*(?:${districtPattern})`, 'i');
    let processCount = 0;
    let offset = 0;
    let rawDataset = await rawDataLogic.getAll(limit, offset);
    const loop = setInterval(async () => {
        if (!rawDataset.hasNext && rawDataset.documents.length === 0) {
            clearInterval(loop);
            new ConsoleLog(ConsoleConstant.Type.INFO, `Clean data - Delete invalid address - Complete`).show();
            script.next();
            return;
        }

        if (processCount > PROCESS_LIMIT) {
            return;
        }

        const rawData = rawDataset.documents.shift();
        if (!rawData) {
            return;
        }
        processCount += 1;

        if (rawDataset.documents.length === 0) {
            offset += limit;
            rawDataset = await rawDataLogic.getAll(limit, offset);
        }

        if (!addressPattern.test(rawData.address)) {
            try {
                await rawDataLogic.delete(rawData._id);
                new ConsoleLog(
                    ConsoleConstant.Type.INFO,
                    `Clean data - Invalid address -> RID: ${rawData._id} - ${rawData.address}`
                ).show();
            } catch (error) {
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Clean data - Invalid address -> RID: ${rawData._id} - Error: ${error.message}`
                ).show();
            }
        }

        processCount -= 1;
    }, 0);
};

/**
 * Generate script of process
 */
async function* generateScript() {
    const startTime: [number, number] = process.hrtime();
    const telegramChatBotInstance: ChatBotTelegram = ChatBotTelegram.getInstance();
    await DatabaseMongodb.getInstance().connect();
    await telegramChatBotInstance.sendMessage(`<b>🤖[Clean data]🤖</b>\n📝 Start clean data...`);

    new ConsoleLog(ConsoleConstant.Type.INFO, `Clean data - Delete duplicate - Start`).show();
    await deleteDuplicateData();
    yield 'Step 1: Delete duplicate';

    new ConsoleLog(ConsoleConstant.Type.INFO, `Clean data - Delete invalid address - Start`).show();
    await deleteInvalidAddressData();
    yield 'Step 1: Delete invalid address';

    const executeTime: string = DateTime.convertTotalSecondsToTime(process.hrtime(startTime)[0]);
    await telegramChatBotInstance.sendMessage(
        `<b>🤖[Clean data]🤖</b>\n✅ Clean data complete. Execute time: ${executeTime}`
    );
    new ConsoleLog(ConsoleConstant.Type.INFO, `Clean data - Execute time: ${executeTime} - Complete`).show();
    process.exit(0);
    return 'Done';
}

/**
 * Main function
 */
process.on(
    'message',
    async (): Promise<void> => {
        try {
            script = generateScript();
            script.next();
        } catch (error) {
            await ChatBotTelegram.getInstance().sendMessage(
                `<b>🤖[Clean data]🤖</b>\n❌ Clean data failed.\nError:<code>${error.message}</code>`
            );
            new ConsoleLog(ConsoleConstant.Type.ERROR, `Clean data - Error: ${error.message}`).show();
            process.exit(1);
        }
    }
);
