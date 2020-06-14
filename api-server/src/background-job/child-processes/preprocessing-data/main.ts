import '../../../prepend';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import ChatBotTelegram from '@util/chatbot/ChatBotTelegram';
import { convertTotalSecondsToTime } from '@util/helper/datetime';
import { analyticsPhase } from './analytics';
import { addCoordinatePhase } from './add-coordinate';
import { summaryPhase } from './summary';
import { mapPointPhase } from './map-point';
import { RawDataDocumentModel } from '@service/raw-data/interface';
import { DOCUMENT_LIMIT } from '@background-job/child-processes/preprocessing-data/constant';
import RawDataLogic from '@service/raw-data/RawDataLogic';

const telegramChatBotInstance = ChatBotTelegram.getInstance();
let script: AsyncGenerator;

const visualizationDataHandler = async (): Promise<void> => {
    const rawDataLogic = RawDataLogic.getInstance();
    let documents: RawDataDocumentModel[] = (
        await rawDataLogic.getAll({
            limit: DOCUMENT_LIMIT,
            conditions: {
                $or: [
                    { 'status.isMapPoint': false },
                    { 'status.isSummary': false },
                    { 'status.isAnalytics': false },
                ],
            },
        })
    ).documents;

    while (documents.length > 0) {
        for (const rawData of documents) {
            try {
                if (!rawData.status.isMapPoint && rawData.coordinateId) {
                    await mapPointPhase(rawData);
                    rawData.status.isMapPoint = true;
                }

                if (!rawData.status.isSummary) {
                    await summaryPhase(rawData);
                    rawData.status.isSummary = true;
                }

                if (!rawData.status.isAnalytics) {
                    await analyticsPhase(rawData);
                    rawData.status.isAnalytics = true;
                }

                await rawData.save();
            } catch (error) {
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Preprocessing data - RID: ${rawData._id} - Error: ${error.message}`
                ).show();
            }
        }
        documents = (
            await rawDataLogic.getAll({
                limit: DOCUMENT_LIMIT,
                conditions: {
                    $or: [
                        { 'status.isMapPoint': false },
                        { 'status.isSummary': false },
                        { 'status.isAnalytics': false },
                    ],
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

    await addCoordinatePhase(script);
    yield 'Phase 1: Add coordinate';

    await visualizationDataHandler();
    yield 'Phase 2: Visualization data handler';

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
            script = await generateScript();
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
