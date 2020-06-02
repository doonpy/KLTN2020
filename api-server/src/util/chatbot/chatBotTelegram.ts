import TelegramBot, { Message } from 'node-telegram-bot-api';

const ADMIN_TELEGRAM_ID = 896052128;
const receiverList = [ADMIN_TELEGRAM_ID];

export default class ChatBotTelegram {
    private static instance: ChatBotTelegram;

    private telegramBot = new TelegramBot(process.env.CHAT_BOT_TELEGRAM_TOKEN || '');

    constructor() {
        this.bindListener();
    }

    /**
     * Get instance
     */
    public static getInstance(): ChatBotTelegram {
        if (!this.instance) {
            this.instance = new ChatBotTelegram();
        }

        return this.instance;
    }

    /**
     * @param message
     */
    public async sendMessage(message: string): Promise<void> {
        for (const receiver of receiverList) {
            if (!this.telegramBot) {
                return;
            }
            await this.telegramBot.sendMessage(receiver, `<b>[PID: ${process.pid}]</b>\n${message}`, {
                // eslint-disable-next-line @typescript-eslint/camelcase
                parse_mode: 'HTML',
            });
        }
    }

    /**
     * Bind listener event
     */
    private bindListener(): void {
        this.telegramBot.onText(/\/subscribe/, async (msg: Message) => {
            const chatId = msg.chat.id;
            if (receiverList.findIndex((receiver) => receiver === chatId) > 0) {
                await this.telegramBot.sendMessage(
                    msg.chat.id,
                    `🤖<b>[Message]</b>🤖\n❌ You have already subscribed to notifications.`
                );
                return;
            }
            receiverList.push(msg.chat.id);
            await this.telegramBot.sendMessage(
                msg.chat.id,
                `🤖<b>[Message]</b>🤖\n✅ Subscribe to notifications success.`
            );
        });
    }
}
