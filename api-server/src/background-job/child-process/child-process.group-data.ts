import '../../prepend';
import ConsoleLog from '@util/console/console.log';
import ConsoleConstant from '@util/console/console.constant';
import ChatBotTelegram from '@util/chatbot/chatBotTelegram';
import GroupData from '../group-data/group-data';
import { GroupedDataConstant } from './child-process.constant';

const telegramChatBotInstance = ChatBotTelegram.getInstance();
const groupDataInstance = new GroupData();
const { MESSAGE_TYPE } = GroupedDataConstant;

const start = async (
    transactionTypeId: number,
    propertyTypeId: number
): Promise<void> => {
    try {
        await telegramChatBotInstance.sendMessage(
            `<b>🤖[Group data]🤖</b>\n📝 Start group data -> TID: ${transactionTypeId} - PID: ${propertyTypeId}`
        );
        new ConsoleLog(
            ConsoleConstant.Type.INFO,
            `Group data -> TID: ${transactionTypeId} - PID: ${propertyTypeId} - Start`
        ).show();

        await groupDataInstance.start(transactionTypeId, propertyTypeId);
    } catch (error) {
        await telegramChatBotInstance.sendMessage(
            `<b>🤖[Group data]🤖</b>\n❌ Group data failed.\nError: <code>${error.message}</code>`
        );
        new ConsoleLog(
            ConsoleConstant.Type.ERROR,
            `Group data - Error: ${error.cause || error.message}`
        ).show();
    }
    process.exit(0);
};

process.on(
    'message',
    async ({
        messageType,
        transactionTypeId,
        propertyTypeId,
    }: {
        messageType: number;
        transactionTypeId: number;
        propertyTypeId: number;
    }): Promise<void> => {
        switch (messageType) {
            case MESSAGE_TYPE.START:
                await start(transactionTypeId, propertyTypeId);
                break;
            case MESSAGE_TYPE.SUSPENSE:
                groupDataInstance.suspense();
                break;
            case MESSAGE_TYPE.CONTINUE:
                groupDataInstance.continue();
                break;
            case MESSAGE_TYPE.IS_SUSPENSE:
                (process as any).send({
                    isSuspense: groupDataInstance.isProcessSuspense(),
                });
                break;
            default:
                await ChatBotTelegram.getInstance().sendMessage(
                    `<b>🤖[Group data]🤖</b>\nGroup data - Force stop...`
                );
                new ConsoleLog(
                    ConsoleConstant.Type.INFO,
                    `Group data - Force stop...`
                ).show();
                process.exit(0);
        }
    }
);
