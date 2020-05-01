import { DocumentQuery } from 'mongoose';
import { CatalogApiModel, CatalogDocumentModel } from '../catalog/catalog.interface';
import {
    CommonApiModel,
    CommonDocumentModel,
    CommonLogicBaseInterface,
} from '../../common/service/common.service.interface';

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

export interface DetailUrlLogicInterface extends CommonLogicBaseInterface {
    /**
     * @param {string} url
     *
     * @return {Promise<boolean>}
     */
    isExistsWithUrl(url: string): Promise<boolean>;

    /**
     * @param {string} url
     * @param {boolean | undefined} isNot
     *
     * @return {Promise<void>}
     */
    checkExistsWithUrl(url: string, isNot?: boolean): Promise<void>;

    /**
     * @param {object[]} aggregations
     *
     * @return {Promise<any[]>}
     */
    aggregationQuery(aggregations: object[]): Promise<object[]>;

    /**
     * @param {DocumentQuery<DetailUrlDocumentModel | DetailUrlDocumentModel[] | null, DetailUrlDocumentModel, {}>} query
     *
     * @return {DocumentQuery<DetailUrlDocumentModel | DetailUrlDocumentModel[] | null, DetailUrlDocumentModel, {}>}
     */
    addPopulateQuery(
        query: DocumentQuery<DetailUrlDocumentModel | DetailUrlDocumentModel[] | null, DetailUrlDocumentModel, {}>
    ): DocumentQuery<DetailUrlDocumentModel | DetailUrlDocumentModel[] | null, DetailUrlDocumentModel, {}>;

    /**
     * @param {DetailUrlDocumentModel} document
     *
     * @return {Promise<DetailUrlDocumentModel>}
     */
    getPopulateDocument(document: DetailUrlDocumentModel): Promise<DetailUrlDocumentModel>;
}
