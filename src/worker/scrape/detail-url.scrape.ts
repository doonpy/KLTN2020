import CatalogLogic from '../../modules/catalog/catalog.logic';

class DetailUrlScrape {
    private catalogId: number;
    private catalogLogic: CatalogLogic = new CatalogLogic();

    constructor(catalogId: number) {
        this.catalogId = catalogId;
    }

    public start(): void {
        this.catalogLogic.getById(this.catalogId).then((catalog: object): void => {
            if (!catalog) {
                return;
            }
        });
    }
}
