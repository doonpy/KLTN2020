import { Database } from '../../services/database/database.index';
import { RawData } from '../../services/raw-data/raw-data.index';
import { Coordinate } from '../../services/coordinate/coordinate.index';
import ConsoleLog from '../../util/console/console.log';
import { ConsoleConstant } from '../../util/console/console.constant';
import ChatBotTelegram from '../../services/chatbot/chatBotTelegram';

process.on(
    'message',
    async (): Promise<void> => {
        try {
            new ChatBotTelegram();
            await new Database.MongoDb().connect();

            await ChatBotTelegram.sendMessage(`<b>🤖[Add coordinate]🤖</b>\n📝 Start add coordinate...`);
            new ConsoleLog(ConsoleConstant.Type.INFO, `Start add coordinate...`).show();

            const rawDataLogic: RawData.Logic = new RawData.Logic();
            const coordinateLogic: Coordinate.Logic = new Coordinate.Logic();
            const limit: number = 1000;
            let offset: number = 0;
            let queryResult: {
                rawDataset: Array<RawData.DocumentInterface>;
                hasNext: boolean;
            } = await rawDataLogic.getAll(
                { $or: [{ coordinate: null }, { coordinate: undefined }] },
                false,
                limit,
                offset
            );

            while (queryResult.hasNext || queryResult.rawDataset.length > 0) {
                for (const rawData of queryResult.rawDataset) {
                    const coordinateDoc: Coordinate.DocumentInterface | null = await coordinateLogic.create(
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

            await ChatBotTelegram.sendMessage(`<b>🤖[Add coordinate]🤖</b>\n✅ Add coordinate complete.`);
            new ConsoleLog(ConsoleConstant.Type.INFO, `Add coordinate complete`).show();
            process.exit(0);
        } catch (error) {
            await ChatBotTelegram.sendMessage(
                `<b>🤖[Add coordinate]🤖</b>\n❌ Add coordinate failed.\nError: ${error.message}`
            );
            new ConsoleLog(ConsoleConstant.Type.INFO, `Add coordinate failed. Error: ${error.message}`).show();
            process.exit(1);
        }
    }
);
