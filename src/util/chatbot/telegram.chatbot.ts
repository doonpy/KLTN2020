import ChatBotBase from './chatbot.base';
import TelegramBot from 'node-telegram-bot-api';

const ADMIN_TELEGRAM_ID: number = 896052128;

class TelegramChatBot extends ChatBotBase {
    private telegramBot: TelegramBot = new TelegramBot(process.env.CHAT_BOT_TELEGRAM_TOKEN || '');
    private receiverList: Array<number | string> = [ADMIN_TELEGRAM_ID];

    constructor() {
        super();
    }

    /**
     * @param message
     */
    public sendMessage(message: string): void {
        this.receiverList.forEach(
            async (receiver: number | string): Promise<void> => {
                try {
                    await this.telegramBot.sendMessage(receiver, message, { parse_mode: 'HTML' });
                } catch (error) {
                    throw error;
                }
            }
        );
    }
}

export default TelegramChatBot;
