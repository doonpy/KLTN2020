import ConsoleLog from '../../util/console/console.log';
import ConsoleConstant from '../../util/console/console.constant';
import GroupData from '../group-data/group-data';
import ChatBotTelegram from '../../util/chatbot/chatBotTelegram';
import DatabaseMongodb from '../../service/database/mongodb/database.mongodb';
import DateTime from '../../util/datetime/datetime';

process.on(
    'message',
    async ({
        transactionTypeId,
        propertyTypeId,
    }: {
        transactionTypeId: number;
        propertyTypeId: number;
    }): Promise<void> => {
        const startTime: [number, number] = process.hrtime();
        const telegramChatBotInstance: ChatBotTelegram = ChatBotTelegram.getInstance();
        const groupDataInstance: GroupData = new GroupData();
        try {
            await DatabaseMongodb.getInstance().connect();

            await telegramChatBotInstance.sendMessage(
                `<b>🤖[Group data]🤖</b>\n📝 Start group data -> TID: ${transactionTypeId} - PID: ${propertyTypeId}`
            );
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Group data -> TID: ${transactionTypeId} - PID: ${propertyTypeId} - Start`
            ).show();

            await groupDataInstance.start(transactionTypeId, propertyTypeId);

            const executeTime: string = DateTime.convertTotalSecondsToTime(process.hrtime(startTime)[0]);
            await telegramChatBotInstance.sendMessage(
                `<b>🤖[Group data]🤖</b>\n✅ Group data complete -> TID: ${transactionTypeId} - PID: ${propertyTypeId} - Execute time: ${executeTime}`
            );
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Group data -> TID: ${transactionTypeId} - PID: ${propertyTypeId} - Execute time: ${executeTime} - Complete`
            ).show();
            process.exit(0);
        } catch (error) {
            await telegramChatBotInstance.sendMessage(
                `<b>🤖[Group data]🤖</b>\n❌ Group data failed.\nError: <code>${error.message}</code>`
            );
            new ConsoleLog(ConsoleConstant.Type.ERROR, `Group data - Error: ${error.cause || error.message}`).show();
            process.exit(1);
        }
    }
);
