import { DocumentQuery } from 'mongoose';
import {
    CommonApiModel,
    CommonDocumentModel,
    CommonLogicBaseInterface,
} from '../../common/service/common.service.interface';
import { DetailUrlApiModel, DetailUrlDocumentModel } from '../detail-url/detail-url.interface';
import { CoordinateApiModel, CoordinateDocumentModel } from '../coordinate/coordinate.interface';

export interface RawDataApiModel extends CommonApiModel {
    detailUrl: DetailUrlApiModel | number | null;
    transactionType: { id: number; wording: string[] } | null;
    propertyType: { id: number; wording: string[] } | null;
    postDate: string | null;
    title: string | null;
    describe: string | null;
    price: {
        value: number | null;
        currency: string | null;
        timeUnit: { id: number; wording: string[] } | null;
    } | null;
    acreage: {
        value: number | null;
        measureUnit: string | null;
    } | null;
    address: string | null;
    others:
        | [
              {
                  name: string | null;
                  value: string | null;
              }
          ]
        | []
        | null;
    coordinate: CoordinateApiModel | number | null;
    isGrouped: boolean | null;
}

export interface RawDataDocumentModel extends CommonDocumentModel {
    detailUrlId: DetailUrlDocumentModel | number;
    transactionType: number;
    propertyType: number;
    postDate: string;
    title: string;
    describe: string;
    price: {
        value: number;
        currency: string;
        timeUnit: number;
    };
    acreage: {
        value: number;
        measureUnit: string;
    };
    address: string;
    others: [
        {
            name: string;
            value: string;
        }
    ];
    coordinateId: CoordinateDocumentModel | number;
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

    /**
     * @param {object[]} aggregations
     *
     * @return {Promise<any[]>}
     */
    queryWithAggregation(aggregations: object[]): Promise<any[]>;

    /**
     * @param {object | undefined} conditions
     *
     * @return {number}
     */
    countDocumentsWithConditions(conditions?: object): Promise<number>;
}
