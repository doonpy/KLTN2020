import 'module-alias/register';
import '../../prepend';
import ConsoleLog from '@util/console/console.log';
import ConsoleConstant from '@util/console/console.constant';
import CatalogLogic from '@service/catalog/catalog.logic';
import PatternLogic from '@service/pattern/pattern.logic';
import ScrapeDetailUrl from '../scrape/detail-url/scrape.detail-url';

process.on(
    'message',
    async ({ catalogId }: { catalogId: number }): Promise<void> => {
        try {
            const catalogLogic = CatalogLogic.getInstance();
            await catalogLogic.checkExisted({ _id: catalogId });
            const catalog = await catalogLogic.getById(catalogId);
            await PatternLogic.getInstance().checkExisted({
                _id: catalog.patternId,
            });

            const scrapeJob = new ScrapeDetailUrl(catalog);
            await scrapeJob.start();
        } catch (error) {
            new ConsoleLog(
                ConsoleConstant.Type.ERROR,
                `Scrape data - Error: ${error.cause || error.message}`
            ).show();
            process.exit(1);
        }
    }
);
