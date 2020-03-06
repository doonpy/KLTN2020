import ChatBotBase from './chatbot.base';
import TelegramBot, { Message } from 'node-telegram-bot-api';

const ADMIN_TELEGRAM_ID: number = 896052128;

let telegramBot: TelegramBot;
let receiverList: Array<number | string> = [ADMIN_TELEGRAM_ID];

export default class ChatBotTelegram extends ChatBotBase {
    constructor() {
        super();
        telegramBot = new TelegramBot(process.env.CHAT_BOT_TELEGRAM_TOKEN || '');
        this.bindListener();
    }

    /**
     * Get instance
     */
    public static getInstance(): TelegramBot {
        if (!telegramBot) {
            telegramBot = new TelegramBot(process.env.CHAT_BOT_TELEGRAM_TOKEN || '');
        }

        return telegramBot;
    }

    /**
     * @param message
     */
    public static sendMessage(message: string): void {
        receiverList.forEach(
            async (receiver: number | string): Promise<void> => {
                try {
                    if (!telegramBot) {
                        return;
                    }
                    await telegramBot.sendMessage(receiver, message, { parse_mode: 'HTML' });
                } catch (error) {
                    throw error;
                }
            }
        );
    }

    /**
     * Bind listener event
     */
    private bindListener(): void {
        telegramBot.onText(/\/subscribe/, async (msg: Message) => {
            let chatId: number = msg.chat.id;
            console.log(chatId);
            if (receiverList.findIndex(receiver => receiver === chatId) > 0) {
                await telegramBot.sendMessage(
                    msg.chat.id,
                    `🤖<b>[Message]</b>🤖\n❌ You have already subscribed to notifications.`
                );
                return;
            }
            receiverList.push(msg.chat.id);
            await telegramBot.sendMessage(
                msg.chat.id,
                `🤖<b>[Message]</b>🤖\n✅ Subscribe to notifications success.`
            );
        });
    }
}
