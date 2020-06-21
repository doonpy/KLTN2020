import '../../../prepend';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import ChatBotTelegram from '@util/chatbot/ChatBotTelegram';
import { convertTotalSecondsToTime } from '@util/helper/datetime';
import { deleteInvalidAddress } from '@background-job/child-processes/clean-data/delete-invalid-address';
import { deleteDuplicate } from '@background-job/child-processes/clean-data/delete-duplicate';
import { deleteInvalidPrice } from '@background-job/child-processes/clean-data/delete-invalid-price';

let script: AsyncGenerator;

/**
 * Generate script of process
 */
async function* generateScript() {
    const startTime: [number, number] = process.hrtime();
    const telegramChatBotInstance = ChatBotTelegram.getInstance();
    await telegramChatBotInstance.sendMessage(
        `<b>🤖[Clean data]🤖</b>\n📝 Start clean data...`
    );

    await deleteDuplicate(script);
    yield 'Phase 1: Delete duplicate';

    await deleteInvalidPrice(script);
    yield 'Phase 2: Delete invalid price';

    await deleteInvalidAddress(script);
    yield 'Phase 3: Delete invalid address';

    const executeTime = convertTotalSecondsToTime(process.hrtime(startTime)[0]);
    await telegramChatBotInstance.sendMessage(
        `<b>🤖[Clean data]🤖</b>\n✅ Clean data complete. Execute time: ${executeTime}`
    );
    new ConsoleLog(
        ConsoleConstant.Type.INFO,
        `Clean data - Execute time: ${executeTime} - Complete`
    ).show();
    process.exit(0);
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
