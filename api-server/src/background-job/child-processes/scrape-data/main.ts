import 'module-alias/register';
import '../../../prepend';
import ConsoleLog from '@util/console/ConsoleLog';
import ConsoleConstant from '@util/console/constant';
import CatalogLogic from '@service/catalog/CatalogLogic';
import PatternLogic from '@service/pattern/PatternLogic';
import ScrapeDetailUrl from '@background-job/child-processes/scrape-data/detail-url/ScrapeDetailUrl';

process.on(
    'message',
    async ({ catalogId }: { catalogId: number }): Promise<void> => {
        try {
            const catalogLogic = CatalogLogic.getInstance();
            await catalogLogic.checkExisted({ _id: catalogId });
            const catalog = await catalogLogic.getById(catalogId);
            await new ScrapeDetailUrl(catalog!).start();
        } catch (error) {
            new ConsoleLog(
                ConsoleConstant.Type.ERROR,
                `Scrape data - Error: ${error.cause || error.message}`
            ).show();
            process.exit(1);
        }
    }
);
