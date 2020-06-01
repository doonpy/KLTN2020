import {
    CommonApiModel,
    CommonDocumentModel,
    CommonLogicBaseInterface,
} from '@common/service/common.service.interface';
import { RawDataApiModel, RawDataDocumentModel } from '../raw-data/raw-data.interface';

export interface GroupedDataApiModel extends CommonApiModel {
    items: (RawDataApiModel | number | null)[];
}

export interface GroupedDataDocumentModel extends CommonDocumentModel {
    items: (RawDataDocumentModel | number)[];
}

export interface GroupedDataLogicInterface
    extends CommonLogicBaseInterface<GroupedDataDocumentModel, GroupedDataApiModel> {
    /**
     * @param {Array<object>} aggregations
     *
     * @return {Promise<Array<any>>}
     */
    aggregationQuery(aggregations: object[]): Promise<object[]>;
}
