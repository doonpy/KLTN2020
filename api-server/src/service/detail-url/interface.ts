import { CommonApiModel, CommonDocumentModel } from '@common/service/interface';
import { CatalogApiModel, CatalogDocumentModel } from '../catalog/interface';

export interface DetailUrlApiModel extends CommonApiModel {
    catalog: CatalogApiModel | number | null;
    url: string | null;
    isExtracted: boolean | null;
    requestRetries: number | null;
}

export interface DetailUrlDocumentModel extends CommonDocumentModel {
    catalogId: CatalogDocumentModel | number;
    url: string;
    isExtracted: boolean;
    requestRetries: number;
}
