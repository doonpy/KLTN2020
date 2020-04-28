import ConsoleLog from '../../util/console/console.log';
import ConsoleConstant from '../../util/console/console.constant';
import ChatBotTelegram from '../../util/chatbot/chatBotTelegram';
import RawDataLogic from '../../service/raw-data/raw-data.logic';
import CoordinateLogic from '../../service/coordinate/coordinate.logic';
import DatabaseMongodb from '../../service/database/mongodb/database.mongodb';
import { RawDataDocumentModel } from '../../service/raw-data/raw-data.interface';
import { CoordinateDocumentModel } from '../../service/coordinate/coordinate.interface';
import DateTime from '../../util/datetime/datetime';

process.on(
    'message',
    async (): Promise<void> => {
        const startTime: [number, number] = process.hrtime();
        const telegramChatBotInstance: ChatBotTelegram = ChatBotTelegram.getInstance();
        const mongoDbInstance: DatabaseMongodb = DatabaseMongodb.getInstance();
        try {
            await mongoDbInstance.connect();

            await telegramChatBotInstance.sendMessage(`<b>🤖[Add coordinate]🤖</b>\n📝 Start add coordinate...`);
            new ConsoleLog(ConsoleConstant.Type.INFO, `Add coordinate - Start`).show();

            const rawDataLogic: RawDataLogic = RawDataLogic.getInstance();
            const coordinateLogic: CoordinateLogic = CoordinateLogic.getInstance();
            const limit = 1000;
            let offset = 0;
            let rawDataset: {
                documents: RawDataDocumentModel[];
                hasNext: boolean;
            } = await rawDataLogic.getAll(limit, offset, { coordinate: null });

            while (rawDataset.hasNext || rawDataset.documents.length > 0) {
                for (const document of rawDataset.documents) {
                    let coordinateDoc: CoordinateDocumentModel = await coordinateLogic.getByLocation(document.address);
                    if (!coordinateDoc) {
                        coordinateDoc = await coordinateLogic.create(({
                            location: document.address,
                        } as unknown) as CoordinateDocumentModel);
                    }

                    document.coordinate = coordinateDoc._id;
                    await rawDataLogic.update(document._id, document);
                    new ConsoleLog(
                        ConsoleConstant.Type.INFO,
                        `Add coordinate - RID:${document._id} -> CID:${coordinateDoc._id}`
                    ).show();
                }
                offset += limit;
                rawDataset = await rawDataLogic.getAll(limit, offset, { coordinate: null });
            }

            const executeTime: string = DateTime.convertTotalSecondsToTime(process.hrtime(startTime)[0]);
            await telegramChatBotInstance.sendMessage(
                `<b>🤖[Add coordinate]🤖</b>\n✅ Add coordinate complete. Execute time: ${executeTime}`
            );
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Add coordinate - Execute time: ${executeTime} - Complete`
            ).show();
            process.exit(0);
        } catch (error) {
            await telegramChatBotInstance.sendMessage(
                `<b>🤖[Add coordinate]🤖</b>\n❌ Add coordinate failed.\nError: ${error.message}`
            );
            new ConsoleLog(
                ConsoleConstant.Type.ERROR,
                `Add coordinate failed - Error: ${error.cause || error.message}`
            ).show();
            process.exit(1);
        }
    }
);
