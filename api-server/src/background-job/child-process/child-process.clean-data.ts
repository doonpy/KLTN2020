import 'module-alias/register';
import '@root/prepend';
import ConsoleLog from '@util/console/console.log';
import ConsoleConstant from '@util/console/console.constant';
import ChatBotTelegram from '@util/chatbot/chatBotTelegram';
import DetailUrlLogic from '@service/detail-url/detail-url.logic';
import RawDataLogic from '@service/raw-data/raw-data.logic';
import { RawDataDocumentModel } from '@service/raw-data/raw-data.interface';
import { DetailUrlDocumentModel } from '@service/detail-url/detail-url.interface';
import VisualAdministrativeCountryLogic from '@service/visual/administrative/country/visual.administrative.country.logic';
import VisualAdministrativeProvinceLogic from '@service/visual/administrative/province/visual.administrative.province.logic';
import VisualAdministrativeDistrictLogic from '@service/visual/administrative/district/visual.administrative.district.logic';
import VisualAdministrativeWardLogic from '@service/visual/administrative/ward/visual.administrative.ward.logic';
import { convertTotalSecondsToTime } from '@util/helper/datetime';
import { CleanDataConstant } from './child-process.constant';

type AggregationGroupDataResult = {
    _id: string;
    docList: DetailUrlDocumentModel[];
    docSize: number;
};

const detailUrlLogic = DetailUrlLogic.getInstance();
const rawDataLogic = RawDataLogic.getInstance();
const PROCESSES_LIMIT = 30;

let script: AsyncGenerator;

/**
 * Delete raw data have invalid address
 *
 * @param {RawDataDocumentModel} rawData
 */
const deleteAction = async (rawData: RawDataDocumentModel): Promise<void> => {
    await rawDataLogic.delete(rawData._id);
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        `Clean data - Invalid address -> RID: ${rawData._id} - ${rawData.address}`
    ).show();
};

/**
 * Delete duplicate detail URL and raw data which scraped from that.
 */
const deleteDuplicateData = async (): Promise<void> => {
    const aggregationResult = await detailUrlLogic.getWithAggregation<
        AggregationGroupDataResult
    >(CleanDataConstant.DUPLICATE_DETAIL_URL_AGGREGATIONS);
    let processCount = 0;

    const loop = setInterval(async (): Promise<void> => {
        if (aggregationResult.length === 0) {
            clearInterval(loop);
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Clean data - Delete duplicate - Complete`
            ).show();
            script.next();
            return;
        }

        if (processCount > PROCESSES_LIMIT) {
            return;
        }

        const item = aggregationResult.shift();
        if (!item) {
            return;
        }
        processCount++;

        item.docList.shift();
        for (const doc of item.docList) {
            try {
                await detailUrlLogic.delete(doc._id);
                new ConsoleLog(
                    ConsoleConstant.Type.INFO,
                    `Clean data - Duplicate data -> DID:${doc._id}`
                ).show();
            } catch (error) {
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Clean data - Duplicate data -> DID: ${doc._id}) - Error: ${error.message}`
                ).show();
            }

            if (doc.isExtracted) {
                try {
                    const { documents } = await rawDataLogic.getAll({
                        conditions: { detailUrlId: doc._id },
                    });
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

        processCount--;
    }, 0);
};

/**
 * Delete data which have address not contain district or ward
 */
const deleteInvalidAddressData = async (): Promise<void> => {
    const countryPattern = (
        await VisualAdministrativeCountryLogic.getInstance().getAll({})
    ).documents
        .map((country) => country.name)
        .join('|');
    const provincePattern = (
        await VisualAdministrativeProvinceLogic.getInstance().getAll({})
    ).documents
        .map((province) => province.name)
        .join('|');
    const districtPattern = (
        await VisualAdministrativeDistrictLogic.getInstance().getAll({})
    ).documents
        .map((district) => district.name)
        .join('|');
    const wards: string[] = (
        await VisualAdministrativeWardLogic.getInstance().getAll({})
    ).documents.map((ward) => ward.name);
    const wardPattern = wards
        .filter((ward, index) => wards.lastIndexOf(ward) === index)
        .join('|');
    const validDistrictAndWardPattern = new RegExp(
        `(${wardPattern}).*(${districtPattern})`,
        'i'
    );
    const validProvincePattern = new RegExp(`(${provincePattern})`, 'i');
    const validCountryPattern = new RegExp(`(${countryPattern})$`, 'i');
    const DOCUMENTS_LIMIT = 1000;
    let processCount = 0;
    let offset = 0;
    let rawDataset = await rawDataLogic.getAll({
        limit: DOCUMENTS_LIMIT,
        offset,
        conditions: {
            coordinateId: null,
        },
    });
    const loop = setInterval(async () => {
        if (!rawDataset.hasNext && rawDataset.documents.length === 0) {
            clearInterval(loop);
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Clean data - Delete invalid address - Complete`
            ).show();
            script.next();
            return;
        }

        if (processCount > PROCESSES_LIMIT) {
            return;
        }

        const rawData = rawDataset.documents.shift();
        if (!rawData) {
            return;
        }
        processCount++;

        if (rawDataset.documents.length === 0) {
            offset += DOCUMENTS_LIMIT;
            rawDataset = await rawDataLogic.getAll({
                limit: DOCUMENTS_LIMIT,
                offset,
                conditions: {
                    coordinateId: null,
                },
            });
        }

        let { address } = rawData;
        try {
            if (!validDistrictAndWardPattern.test(address)) {
                await deleteAction(rawData);
                processCount--;

                return;
            }

            if (validProvincePattern.test(address)) {
                address = address.replace(
                    RegExp(`.*(${provincePattern})`, 'i'),
                    ''
                );
                if (address.length > 0 && !validCountryPattern.test(address)) {
                    await deleteAction(rawData);
                    processCount--;

                    return;
                }
            }

            processCount--;
        } catch (error) {
            new ConsoleLog(
                ConsoleConstant.Type.ERROR,
                `Clean data - Invalid address -> RID: ${rawData._id} - Error: ${error.message}`
            ).show();
            processCount--;
        }
    }, 0);
};

/**
 * Generate script of process
 */
async function* generateScript() {
    const startTime = process.hrtime();
    const telegramChatBotInstance = ChatBotTelegram.getInstance();
    await telegramChatBotInstance.sendMessage(
        `<b>🤖[Clean data]🤖</b>\n📝 Start clean data...`
    );

    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        `Clean data - Delete duplicate - Start`
    ).show();
    await deleteDuplicateData();
    yield 'Step 1: Delete duplicate';

    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        `Clean data - Delete invalid address - Start`
    ).show();
    await deleteInvalidAddressData();
    yield 'Step 1: Delete invalid address';

    const executeTime = convertTotalSecondsToTime(process.hrtime(startTime)[0]);
    await telegramChatBotInstance.sendMessage(
        `<b>🤖[Clean data]🤖</b>\n✅ Clean data complete. Execute time: ${executeTime}`
    );
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        `Clean data - Execute time: ${executeTime} - Complete`
    ).show();
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
            new ConsoleLog(
                ConsoleConstant.Type.ERROR,
                `Clean data - Error: ${error.message}`
            ).show();
            process.exit(1);
        }
    }
);
