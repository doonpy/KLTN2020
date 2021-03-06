import '../../../prepend';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import ChatBotTelegram from '@util/chatbot/ChatBotTelegram';
import { convertTotalSecondsToTime } from '@util/helper/datetime';
import { addCoordinatePhase } from './add-coordinate';
import { preprocessingDataPhase } from '@background-job/child-processes/preprocessing-data/preprocessing-data';

const telegramChatBotInstance = ChatBotTelegram.getInstance();
let script: AsyncGenerator;

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

    await preprocessingDataPhase(script);
    yield 'Phase 2: Preprocessing data';

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
