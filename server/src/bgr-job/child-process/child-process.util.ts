import ConsoleLog from '../../util/console/console.log';
import { ConsoleConstant } from '../../util/console/console.constant';
import ChatBotTelegram from '../../util/chatbot/chatBotTelegram';
import Timeout = NodeJS.Timeout;
import StringHandler from '../../util/string-handler/string-handler';

/**
 * Set process time out. Process will be killed when timeout.
 * @param {string} processName
 * @param {number} seconds
 */
export const setProcessTimeout = (processName: string, seconds: number): Timeout =>
    setTimeout(async (): Promise<void> => {
        new ConsoleLog(ConsoleConstant.Type.ERROR, `Timeout. Killing ${processName} process...`).show();
        await ChatBotTelegram.getInstance().sendMessage(
            `<b>🤖[${StringHandler.upperCaseFirstCharacter(processName)}]🤖</b>\n❌ Timeout. Killing process...`
        );
        process.kill(1);
        return;
    }, 1000 * seconds);
