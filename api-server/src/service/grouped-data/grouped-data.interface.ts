import { DocumentQuery } from 'mongoose';
import {
    CommonApiModel,
    CommonDocumentModel,
    CommonLogicBaseInterface,
} from '../../common/service/common.service.interface';
import { RawDataApiModel, RawDataDocumentModel } from '../raw-data/raw-data.interface';

export interface GroupedDataApiModel extends CommonApiModel {
    items: RawDataApiModel[] | null | number[];
}

export interface GroupedDataDocumentModel extends CommonDocumentModel {
    items: (RawDataDocumentModel | number)[];
}

export interface GroupedDataLogicInterface extends CommonLogicBaseInterface {
    /**
     * @param {Array<object>} aggregations
     *
     * @return {Promise<Array<any>>}
     */
    aggregationQuery(aggregations: object[]): Promise<object[]>;

    /**
     * @param {DocumentQuery<GroupedDataDocumentModel | GroupedDataDocumentModel[] | null, GroupedDataDocumentModel, {}>} query
     *
     * @return {DocumentQuery<GroupedDataDocumentModel | GroupedDataDocumentModel[] | null, GroupedDataDocumentModel, {}>}
     */
    addPopulateQuery(
        query: DocumentQuery<GroupedDataDocumentModel | GroupedDataDocumentModel[] | null, GroupedDataDocumentModel, {}>
    ): DocumentQuery<GroupedDataDocumentModel | GroupedDataDocumentModel[] | null, GroupedDataDocumentModel, {}>;

    /**
     * @param {GroupedDataDocumentModel} document
     *
     * @return {Promise<GroupedDataDocumentModel>}
     */
    getPopulateDocument(document: GroupedDataDocumentModel): Promise<GroupedDataDocumentModel>;
}
