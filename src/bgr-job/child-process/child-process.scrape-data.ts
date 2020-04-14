import ConsoleLog from '../../util/console/console.log';
import { ConsoleConstant } from '../../util/console/console.constant';
import { Database } from '../../services/database/database.index';
import { BgrScrape } from '../scrape/scrape.index';
import ChatBotTelegram from '../../services/chatbot/chatBotTelegram';

process.on(
    'message',
    async ({ catalogId, scrapeType }: { catalogId: number; scrapeType: string }): Promise<void> => {
        try {
            new ChatBotTelegram();
            await new Database.MongoDb().connect();

            new ConsoleLog(ConsoleConstant.Type.INFO, `Start scrape - TYPE: ${scrapeType} - CID: ${catalogId}`).show();

            let scrapeJob: BgrScrape.RawData | BgrScrape.DetailUrl | undefined;
            switch (scrapeType) {
                case 'detail-url':
                    scrapeJob = new BgrScrape.DetailUrl(catalogId);
                    break;
                case 'raw-data':
                    scrapeJob = new BgrScrape.RawData(catalogId);
                    break;
            }
            if (scrapeJob) {
                await scrapeJob.start();
            } else {
                await ChatBotTelegram.sendMessage(
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
