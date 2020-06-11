import '../../../prepend';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import ChatBotTelegram from '@util/chatbot/ChatBotTelegram';
import RawDataLogic from '@service/raw-data/RawDataLogic';
import { RawDataDocumentModel } from '@service/raw-data/interface';
import { convertTotalSecondsToTime } from '@util/helper/datetime';
import { handleVisualizationAnalytics } from '@background-job/child-processes/preprocessing-data/analytics';
import {
    getAddressProperties,
    getCoordinate,
} from '@background-job/child-processes/preprocessing-data/add-coordinate';
import {
    handleVisualSummaryDistrictData,
    handleVisualSummaryDistrictWardData,
} from '@background-job/child-processes/preprocessing-data/summary';

const telegramChatBotInstance = ChatBotTelegram.getInstance();
const rawDataLogic = RawDataLogic.getInstance();
const DOCUMENT_LIMIT = 1000;
const MAX_PROCESS = 10;
let script: AsyncGenerator;

/**
 * @param rawData
 * @private
 */
const _addCoordinatePhase = async (
    rawData: RawDataDocumentModel
): Promise<void> => {
    const coordinate = await getCoordinate(rawData.address);
    if (!coordinate) {
        new ConsoleLog(
            ConsoleConstant.Type.ERROR,
            `Preprocessing data - Add coordinate - RID: ${rawData._id} - Can't get coordinate of this address - ${rawData.address}`
        ).show();
        await rawDataLogic.delete(rawData._id);
        return;
    }

    try {
        await rawDataLogic.update(rawData._id, {
            coordinateId: coordinate._id,
        } as RawDataDocumentModel);
        new ConsoleLog(
            ConsoleConstant.Type.INFO,
            `Preprocessing data - Add coordinate - RID: ${rawData._id}`
        ).show();
    } catch (error) {
        new ConsoleLog(
            ConsoleConstant.Type.ERROR,
            `Preprocessing data - Add coordinate - RID: ${rawData._id} - Error: ${error.message}`
        ).show();
    }
};

/**
 * Add coordinate phase
 */
const addCoordinatePhase = async (): Promise<void> => {
    let processCounter = 0;
    let documents: RawDataDocumentModel[] = (
        await rawDataLogic.getAll({
            limit: DOCUMENT_LIMIT,
            conditions: {
                coordinateId: null,
            },
        })
    ).documents;
    const loop = setInterval(async (): Promise<void> => {
        if (documents.length === 0 && processCounter === 0) {
            clearInterval(loop);
            script.next();
            return;
        }

        if (processCounter > MAX_PROCESS) {
            return;
        }

        const targetRawData = documents.shift();
        if (!targetRawData) {
            return;
        }
        if (documents.length === 0) {
            documents = (
                await rawDataLogic.getAll({
                    limit: DOCUMENT_LIMIT,
                    conditions: {
                        coordinateId: null,
                    },
                })
            ).documents;
        }

        processCounter++;
        await _addCoordinatePhase(targetRawData);
        processCounter--;
    }, 0);
};

/**
 * Analytics data phase
 */
const analyticsPhase = async (): Promise<void> => {
    let documents = (
        await rawDataLogic.getAll({
            limit: DOCUMENT_LIMIT,
            conditions: {
                'status.isAnalytics': false,
            },
        })
    ).documents;

    while (documents.length > 0) {
        for (const rawData of documents) {
            try {
                await handleVisualizationAnalytics(rawData);
                new ConsoleLog(
                    ConsoleConstant.Type.INFO,
                    `Preprocessing data - Analytics - RID: ${rawData._id}`
                ).show();
            } catch (error) {
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Preprocessing data - Analytics - RID: ${rawData._id} - Error: ${error.message}`
                ).show();
            }
        }
        documents = (
            await rawDataLogic.getAll({
                limit: DOCUMENT_LIMIT,
                conditions: {
                    'status.isAnalytics': false,
                },
            })
        ).documents;
    }
    script.next();
};

/**
 * Summary phase
 */
const summaryPhase = async (): Promise<void> => {
    let documents = (
        await rawDataLogic.getAll({
            limit: DOCUMENT_LIMIT,
            conditions: {
                'status.isSummary': false,
            },
        })
    ).documents;

    while (documents.length > 0) {
        for (const rawData of documents) {
            try {
                const addressProperties = await getAddressProperties(
                    rawData.address
                );

                const districtId: number | undefined =
                    addressProperties.district?._id;
                if (!districtId) {
                    new ConsoleLog(
                        ConsoleConstant.Type.ERROR,
                        `Preprocessing data - RID: ${rawData._id} - District ID is invalid - ${rawData.address}`
                    ).show();
                    await rawDataLogic.delete(rawData._id);
                    return;
                }

                const wardId: number | undefined = addressProperties.ward?._id;
                if (!wardId) {
                    new ConsoleLog(
                        ConsoleConstant.Type.ERROR,
                        `Preprocessing data - RID: ${rawData._id} - Ward ID is invalid - ${rawData.address}`
                    ).show();
                    await rawDataLogic.delete(rawData._id);
                    return;
                }
                rawData.status.isSummary = true;
                await Promise.all([
                    handleVisualSummaryDistrictWardData(
                        districtId,
                        wardId,
                        rawData.transactionType,
                        rawData.propertyType
                    ),
                    handleVisualSummaryDistrictData(
                        districtId,
                        rawData.transactionType,
                        rawData.propertyType
                    ),
                    rawDataLogic.update(rawData._id, rawData),
                ]);
                new ConsoleLog(
                    ConsoleConstant.Type.INFO,
                    `Preprocessing data - Summary - RID: ${rawData._id}`
                ).show();
            } catch (error) {
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Preprocessing data - Summary - RID: ${rawData._id} - Error: ${error.message}`
                ).show();
            }
        }
        documents = (
            await rawDataLogic.getAll({
                limit: DOCUMENT_LIMIT,
                conditions: {
                    'status.isSummary': false,
                },
            })
        ).documents;
    }
    script.next();
};

/**
 * Script of preprocessing data
 */
async function* generateScript() {
    const startTime: [number, number] = process.hrtime();
    await telegramChatBotInstance.sendMessage(
        `<b>🤖[Preprocessing data]🤖</b>\n📝 Start preprocessing data...`
    );
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        `Preprocessing data - Start`
    ).show();
    //
    // await addCoordinatePhase();
    // yield 'Phase 1: Add coordinate';
    //
    // await summaryPhase();
    // yield 'Phase 2: Summary';

    await analyticsPhase();
    yield 'Phase 3: Analytics';

    const executeTime = convertTotalSecondsToTime(process.hrtime(startTime)[0]);
    await telegramChatBotInstance.sendMessage(
        `<b>🤖[Preprocessing data]🤖</b>\n✅ Preprocessing data complete. Execute time: ${executeTime}`
    );
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        `Preprocessing data - Execute time: ${executeTime} - Complete`
    ).show();
    process.exit(0);
    return 'Done';
}

/**
 * Main process
 */
process.on(
    'message',
    async (): Promise<void> => {
        try {
            script = generateScript();
            script.next();
        } catch (error) {
            await telegramChatBotInstance.sendMessage(
                `<b>🤖[Preprocessing data]🤖</b>\n❌ Preprocessing data failed.\nError: ${error.message}`
            );
            new ConsoleLog(
                ConsoleConstant.Type.ERROR,
                `Preprocessing data - Error: ${error.cause || error.message}`
            ).show();

            process.exit(1);
        }
    }
);
