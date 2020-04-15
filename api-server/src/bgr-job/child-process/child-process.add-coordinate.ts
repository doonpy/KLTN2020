import { Database } from '../../services/database/database.index';
import { RawData } from '../../services/raw-data/raw-data.index';
import { Coordinate } from '../../services/coordinate/coordinate.index';
import ConsoleLog from '../../util/console/console.log';
import { ConsoleConstant } from '../../util/console/console.constant';
import ChatBotTelegram from '../../util/chatbot/chatBotTelegram';
import RawDataLogic from '../../services/raw-data/raw-data.logic';
import CoordinateLogic from '../../services/coordinate/coordinate.logic';
import RawDataModelInterface from '../../services/raw-data/raw-data.model.interface';
import CoordinateModelInterface from '../../services/coordinate/coordinate.model.interface';

process.on(
    'message',
    async (): Promise<void> => {
        const telegramChatBotInstance: ChatBotTelegram = ChatBotTelegram.getInstance();
        try {
            await new Database.MongoDb().connect();

            await telegramChatBotInstance.sendMessage(`<b>🤖[Add coordinate]🤖</b>\n📝 Start add coordinate...`);
            new ConsoleLog(ConsoleConstant.Type.INFO, `Start add coordinate...`).show();

            const rawDataLogic: RawDataLogic = new RawData.Logic();
            const coordinateLogic: CoordinateLogic = new Coordinate.Logic();
            const limit: number = 1000;
            let offset: number = 0;
            let queryResult: {
                rawDataset: RawDataModelInterface[];
                hasNext: boolean;
            } = await rawDataLogic.getAll(
                { $or: [{ coordinate: null }, { coordinate: undefined }] },
                false,
                limit,
                offset
            );

            while (queryResult.hasNext || queryResult.rawDataset.length > 0) {
                for (const rawData of queryResult.rawDataset) {
                    const coordinateDoc: CoordinateModelInterface | null = await coordinateLogic.create(
                        rawData.address
                    );
                    if (!coordinateDoc) {
                        continue;
                    }
                    rawData.coordinate = coordinateDoc._id;
                    await rawDataLogic.update(rawData._id, rawData);
                    new ConsoleLog(
                        ConsoleConstant.Type.INFO,
                        `Add coordinate - RID:${rawData._id} -> CID:${coordinateDoc._id}`
                    ).show();
                }
                offset += limit;
                queryResult = await rawDataLogic.getAll({ coordinate: null }, false, limit, offset);
            }

            await telegramChatBotInstance.sendMessage(`<b>🤖[Add coordinate]🤖</b>\n✅ Add coordinate complete.`);
            new ConsoleLog(ConsoleConstant.Type.INFO, `Add coordinate complete`).show();
            process.exit(0);
        } catch (error) {
            await telegramChatBotInstance.sendMessage(
                `<b>🤖[Add coordinate]🤖</b>\n❌ Add coordinate failed.\nError: ${error.message}`
            );
            new ConsoleLog(ConsoleConstant.Type.INFO, `Add coordinate failed. Error: ${error.message}`).show();
            process.exit(1);
        }
    }
);
