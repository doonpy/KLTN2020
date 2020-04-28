import ConsoleLog from '../../util/console/console.log';
import ConsoleConstant from '../../util/console/console.constant';
import ScrapeDetailUrl from '../scrape/detail-url/scrape.detail-url';
import DatabaseMongodb from '../../service/database/mongodb/database.mongodb';
import { CatalogDocumentModel } from '../../service/catalog/catalog.interface';
import CatalogLogic from '../../service/catalog/catalog.logic';
import PatternLogic from '../../service/pattern/pattern.logic';

process.on(
    'message',
    async ({ catalogId }: { catalogId: number }): Promise<void> => {
        const mongoDbInstance: DatabaseMongodb = DatabaseMongodb.getInstance();
        try {
            await mongoDbInstance.connect();

            const catalogLogic: CatalogLogic = CatalogLogic.getInstance();
            await catalogLogic.checkExistsWithId(catalogId);
            const catalog: CatalogDocumentModel = await catalogLogic.getById(catalogId, true);
            await PatternLogic.getInstance().checkExistsWithId(catalog.patternId);

            const scrapeJob = new ScrapeDetailUrl(catalog);
            await scrapeJob.start();
        } catch (error) {
            new ConsoleLog(ConsoleConstant.Type.ERROR, `Scrape data - Error: ${error.cause || error.message}`).show();
            process.exit(1);
        }
    }
);
