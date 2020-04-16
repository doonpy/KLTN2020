import ConsoleLog from '../../util/console/console.log';
import { ConsoleConstant } from '../../util/console/console.constant';
import { Database } from '../../services/database/database.index';
import ChatBotTelegram from '../../util/chatbot/chatBotTelegram';
import ScrapeBase from '../scrape/scrape.base';
import ScrapeDetailUrl from '../scrape/detail-url/scrape.detail-url';
import ScrapeRawData from '../scrape/raw-data/scrape.raw-data';
import DatabaseMongodb from '../../services/database/mongodb/database.mongodb';

process.on(
    'message',
    async ({ catalogId, scrapeType }: { catalogId: number; scrapeType: string }): Promise<void> => {
        const telegramChatBotInstance: ChatBotTelegram = ChatBotTelegram.getInstance();
        const mongoDbInstance: DatabaseMongodb = DatabaseMongodb.getInstance();
        try {
            await mongoDbInstance.connect();

            new ConsoleLog(ConsoleConstant.Type.INFO, `Start scrape - TYPE: ${scrapeType} - CID: ${catalogId}`).show();

            let scrapeJob: ScrapeBase | undefined;
            switch (scrapeType) {
                case 'detail-url':
                    scrapeJob = new ScrapeDetailUrl(catalogId);
                    break;
                case 'raw-data':
                    scrapeJob = new ScrapeRawData(catalogId);
                    break;
            }
            if (scrapeJob) {
                await scrapeJob.start();
            } else {
                await telegramChatBotInstance.sendMessage(
                    `<b>🤖[Scrape data]🤖</b>\n❌ Scrape data failed.\nError: scrapeJob is undefined.`
                );
                new ConsoleLog(
                    ConsoleConstant.Type.ERROR,
                    `Scrape data failed.\nError: scrapeJob is undefined.`
                ).show();
                process.exit(1);
            }
        } catch (error) {
            new ConsoleLog(ConsoleConstant.Type.ERROR, error.message).show();
            process.exit(1);
        }
    }
);
