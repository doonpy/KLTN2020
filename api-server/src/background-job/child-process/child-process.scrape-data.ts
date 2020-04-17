import ConsoleLog from '../../util/console/console.log';
import ConsoleConstant from '../../util/console/console.constant';
import ChatBotTelegram from '../../util/chatbot/chatBotTelegram';
import ScrapeDetailUrl from '../scrape/detail-url/scrape.detail-url';
import ScrapeRawData from '../scrape/raw-data/scrape.raw-data';
import DatabaseMongodb from '../../services/database/mongodb/database.mongodb';
import CatalogModelInterface from '../../services/catalog/catalog.model.interface';
import CatalogLogic from '../../services/catalog/catalog.logic';

process.on(
    'message',
    async ({ catalogId, scrapeType }: { catalogId: number; scrapeType: string }): Promise<void> => {
        const telegramChatBotInstance: ChatBotTelegram = ChatBotTelegram.getInstance();
        const mongoDbInstance: DatabaseMongodb = DatabaseMongodb.getInstance();
        try {
            await mongoDbInstance.connect();

            new ConsoleLog(ConsoleConstant.Type.INFO, `Start scrape - TYPE: ${scrapeType} - CID: ${catalogId}`).show();

            const catalogLogic: CatalogLogic = new CatalogLogic();
            const catalog: CatalogModelInterface | null = await catalogLogic.getById(catalogId);
            if (!catalog) {
                return;
            }
            let scrapeJob: ScrapeDetailUrl | ScrapeRawData | undefined;
            if (scrapeType === 'detail-url') {
                scrapeJob = new ScrapeDetailUrl(catalog);
            } else {
                scrapeJob = new ScrapeRawData(catalog);
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
            new ConsoleLog(ConsoleConstant.Type.ERROR, `Error: ${error.cause || error.message}`).show();
            process.exit(1);
        }
    }
);
