import { ApiModelBase, DocumentModelBase } from '@service/interface';
import { CatalogApiModel, CatalogDocumentModel } from '../catalog/interface';

export interface DetailUrlApiModel extends ApiModelBase {
    catalog: CatalogApiModel | number | null;
    url: string | null;
    isExtracted: boolean | null;
    requestRetries: number | null;
}

export interface DetailUrlDocumentModel extends DocumentModelBase {
    catalogId: CatalogDocumentModel | number;
    url: string;
    isExtracted: boolean;
    requestRetries: number;
}
