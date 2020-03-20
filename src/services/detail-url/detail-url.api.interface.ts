import { Catalog } from '../catalog/catalog.index';

export default interface DetailUrlApiInterface {
    id: number | null;
    catalog: Catalog.ApiInterface | null;
    url: string | null;
    isExtracted: boolean | null;
    requestRetries: number | null;
    createAt: string | null;
    updateAt: string | null;
}
