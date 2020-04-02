import { Catalog } from '../../services/catalog/catalog.index';
import { RawData } from '../../services/raw-data/raw-data.index';

export default class Cleaner {
    private readonly catalogId: number;
    protected startTime: [number, number] | undefined;
    private rawDataLogic: RawData.Logic = new RawData.Logic();

    constructor(catalogId: number) {
        this.catalogId = catalogId;
    }

    public async start(): Promise<void> {
        this.startTime = process.hrtime();

        await Catalog.Logic.checkCatalogExistedWithId(this.catalogId);
        // let rawDataset:Array<RawData.DocumentInterface>=this.rawDataLogic.
    }
}
