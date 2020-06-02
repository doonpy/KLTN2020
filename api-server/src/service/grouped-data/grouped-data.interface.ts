import { CommonApiModel, CommonDocumentModel } from '@common/service/common.service.interface';
import { RawDataApiModel, RawDataDocumentModel } from '../raw-data/raw-data.interface';

export interface GroupedDataApiModel extends CommonApiModel {
    items: (RawDataApiModel | number | null)[];
}

export interface GroupedDataDocumentModel extends CommonDocumentModel {
    items: (RawDataDocumentModel | number)[];
}
