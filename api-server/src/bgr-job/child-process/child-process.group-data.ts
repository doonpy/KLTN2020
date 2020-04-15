import { Database } from '../../services/database/database.index';
import ConsoleLog from '../../util/console/console.log';
import { ConsoleConstant } from '../../util/console/console.constant';
import GroupData from '../group-data/group-data';
import ChatBotTelegram from '../../util/chatbot/chatBotTelegram';

process.on(
    'message',
    async (): Promise<void> => {
        const telegramChatBotInstance: ChatBotTelegram = ChatBotTelegram.getInstance();
        try {
            await new Database.MongoDb().connect();

            await telegramChatBotInstance.sendMessage(`<b>🤖[Group data]🤖</b>\n📝 Start group data...`);
            new ConsoleLog(ConsoleConstant.Type.INFO, `Start group data...`).show();

            await new GroupData().start();

            await telegramChatBotInstance.sendMessage(`<b>🤖[Group data]🤖</b>\n✅ Group data complete.`);
            new ConsoleLog(ConsoleConstant.Type.INFO, `Group data complete.`).show();
            process.exit(0);
        } catch (error) {
            await telegramChatBotInstance.sendMessage(
                `<b>🤖[Group data]🤖</b>\n❌ Group data failed.\nError: <code>${error.message}</code>`
            );
            new ConsoleLog(ConsoleConstant.Type.ERROR, `Group data failed. Error: ${error.message}`).show();
            process.exit(1);
        }
    }
);
