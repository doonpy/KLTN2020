import ConsoleLog from '../../util/console/console.log';
import ConsoleConstant from '../../util/console/console.constant';
import ChatBotTelegram from '../../util/chatbot/chatBotTelegram';
import RawDataLogic from '../../service/raw-data/raw-data.logic';
import CoordinateLogic from '../../service/coordinate/coordinate.logic';
import DatabaseMongodb from '../../service/database/mongodb/database.mongodb';
import { RawDataDocumentModel } from '../../service/raw-data/raw-data.interface';
import { CoordinateDocumentModel } from '../../service/coordinate/coordinate.interface';

process.on(
    'message',
    async (): Promise<void> => {
        const telegramChatBotInstance: ChatBotTelegram = ChatBotTelegram.getInstance();
        const mongoDbInstance: DatabaseMongodb = DatabaseMongodb.getInstance();
        try {
            await mongoDbInstance.connect();

            await telegramChatBotInstance.sendMessage(`<b>🤖[Add coordinate]🤖</b>\n📝 Start add coordinate...`);
            new ConsoleLog(ConsoleConstant.Type.INFO, `Start add coordinate...`).show();

            const rawDataLogic: RawDataLogic = RawDataLogic.getInstance();
            const coordinateLogic: CoordinateLogic = CoordinateLogic.getInstance();
            const limit = 1000;
            let offset = 0;
            let rawDataset: {
                documents: RawDataDocumentModel[];
                hasNext: boolean;
            } = await rawDataLogic.getAll(limit, offset, { $or: [{ coordinate: null }] });

            while (rawDataset.hasNext || rawDataset.documents.length > 0) {
                for (const document of rawDataset.documents) {
                    const coordinateDoc: CoordinateDocumentModel = await coordinateLogic.getByLocation(
                        document.address
                    );

                    if (coordinateDoc) {
                        document.coordinate = coordinateDoc._id;
                    } else {
                        document.coordinate = (
                            await coordinateLogic.create(({
                                location: document.address,
                            } as unknown) as CoordinateDocumentModel)
                        )._id;
                    }
                    await rawDataLogic.update(document._id, document);
                    new ConsoleLog(
                        ConsoleConstant.Type.INFO,
                        `Add coordinate - RID:${document._id} -> CID:${coordinateDoc._id}`
                    ).show();
                }
                offset += limit;
                rawDataset = await rawDataLogic.getAll(limit, offset, { coordinate: null });
            }

            await telegramChatBotInstance.sendMessage(`<b>🤖[Add coordinate]🤖</b>\n✅ Add coordinate complete.`);
            new ConsoleLog(ConsoleConstant.Type.INFO, `Add coordinate complete`).show();
            process.exit(0);
        } catch (error) {
            await telegramChatBotInstance.sendMessage(
                `<b>🤖[Add coordinate]🤖</b>\n❌ Add coordinate failed.\nError: ${error.message}`
            );
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Add coordinate failed. Error: ${error.cause || error.message}`
            ).show();
            process.exit(1);
        }
    }
);
