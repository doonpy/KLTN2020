import { DocumentQuery } from 'mongoose';
import {
    CommonApiModel,
    CommonDocumentModel,
    CommonLogicBaseInterface,
} from '../../common/service/common.service.interface';
import { DetailUrlApiModel, DetailUrlDocumentModel } from '../detail-url/detail-url.interface';
import { CoordinateApiModel, CoordinateDocumentModel } from '../coordinate/coordinate.interface';

export interface RawDataApiModel extends CommonApiModel {
    detailUrl: DetailUrlApiModel | null | number;
    transactionType: string | null;
    propertyType: string | null;
    postDate: string | null;
    title: string | null;
    price: {
        value: string;
        currency: string;
    } | null;
    acreage: {
        value: string;
        measureUnit: string;
    } | null;
    address: string | null;
    others:
        | [
              {
                  name: string;
                  value: string;
              }
          ]
        | []
        | null;
    coordinate: CoordinateApiModel | null;
    isGrouped: boolean | null;
}

export interface RawDataDocumentModel extends CommonDocumentModel {
    detailUrlId: DetailUrlDocumentModel | number;
    transactionType: number;
    propertyType: number;
    postDate: string;
    title: string;
    price: {
        value: string;
        currency: string;
    };
    acreage: {
        value: string;
        measureUnit: string;
    };
    address: string;
    others: [
        {
            name: string;
            value: string;
        }
    ];
    coordinate: CoordinateDocumentModel | number;
    isGrouped: boolean;
}

export interface RawDataLogicInterface extends CommonLogicBaseInterface {
    /**
     * @param {string} propertyTypeData
     *
     * @return {number} index
     */
    getPropertyTypeIndex(propertyTypeData: string): number;

    /**
     * @param {number | DetailUrlDocumentModel} detailUrlId
     *
     * @return {Promise<boolean >}
     */
    isExistsWithDetailUrlId(detailUrlId: number | DetailUrlDocumentModel): Promise<boolean>;

    /**
     * @param {number | DetailUrlDocumentModel} detailUrlId
     * @param {boolean | undefined} isNot
     *
     * @return {Promise<void>}
     */
    checkExistsWithDetailUrlId(detailUrlId: DetailUrlDocumentModel | number, isNot?: boolean): Promise<void>;

    /**
     * @param {DocumentQuery<RawDataDocumentModel | RawDataDocumentModel[] | null, RawDataDocumentModel, {}>} query
     *
     * @return {DocumentQuery<RawDataDocumentModel | RawDataDocumentModel[] | null, RawDataDocumentModel, {}>}
     */
    addPopulateQuery(
        query: DocumentQuery<RawDataDocumentModel | RawDataDocumentModel[] | null, RawDataDocumentModel, {}>
    ): DocumentQuery<RawDataDocumentModel | RawDataDocumentModel[] | null, RawDataDocumentModel, {}>;

    /**
     * @param {RawDataDocumentModel} document
     *
     * @return {Promise<RawDataDocumentModel>}
     */
    getPopulateDocument(document: RawDataDocumentModel): Promise<RawDataDocumentModel>;
}
