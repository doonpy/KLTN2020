import {
    CommonApiModel,
    CommonDocumentModel,
    CommonLogicBaseInterface,
} from '@common/service/common.service.interface';
import { CatalogApiModel, CatalogDocumentModel } from '../catalog/catalog.interface';

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

export interface DetailUrlLogicInterface extends CommonLogicBaseInterface<DetailUrlDocumentModel, DetailUrlApiModel> {
    /**
     * @param {object[]} aggregations
     *
     * @return {Promise<any[]>}
     */
    aggregationQuery(aggregations: object[]): Promise<object[]>;
}
