import CatalogApiInterface from '../catalog/catalog.api.interface';

export default interface DetailUrlApiInterface {
    id: number | null;
    catalog: CatalogApiInterface | null | number;
    url: string | null;
    isExtracted: boolean | null;
    requestRetries: number | null;
    createAt: string | null;
    updateAt: string | null;
}
