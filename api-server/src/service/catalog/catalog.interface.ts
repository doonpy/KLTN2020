import { DocumentQuery } from 'mongoose';
import {
    CommonApiModel,
    CommonDocumentModel,
    CommonLogicBaseInterface,
} from '@common/service/common.service.interface';
import { PatternApiModel, PatternDocumentModel } from '../pattern/pattern.interface';
import { HostApiModel, HostDocumentModel } from '../host/host.interface';

export interface CatalogApiModel extends CommonApiModel {
    title: string | null;
    url: string | null;
    locator: {
        detailUrl: string;
        pageNumber: string;
    } | null;
    host: HostApiModel | number | null;
    pattern: PatternApiModel | number | null;
}

export interface CatalogDocumentModel extends CommonDocumentModel {
    title: string;
    url: string;
    locator: {
        detailUrl: string;
        pageNumber: string;
    };
    hostId: HostDocumentModel | number;
    patternId: PatternDocumentModel | number;
}

export interface CatalogLogicInterface extends CommonLogicBaseInterface {
    /**
     * @param {string} url
     *
     * @return {boolean}
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
     * @param {DocumentQuery<CatalogDocumentModel | CatalogDocumentModel[] | null, CatalogDocumentModel, {}>} query
     *
     * @return {DocumentQuery<CatalogDocumentModel | CatalogDocumentModel[] | null, CatalogDocumentModel, {}>}
     */
    addPopulateQuery(
        query: DocumentQuery<CatalogDocumentModel | CatalogDocumentModel[] | null, CatalogDocumentModel, {}>
    ): DocumentQuery<CatalogDocumentModel | CatalogDocumentModel[] | null, CatalogDocumentModel, {}>;

    /**
     * @param {CatalogDocumentModel} document
     *
     * @return {Promise<CatalogDocumentModel>}
     */
    getPopulateDocument(document: CatalogDocumentModel): Promise<CatalogDocumentModel>;
}
