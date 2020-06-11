import { CommonApiModel, CommonDocumentModel } from '@service/interface';
import { RawDataApiModel, RawDataDocumentModel } from '../raw-data/interface';

export interface GroupedDataApiModel extends CommonApiModel {
    items: Array<RawDataApiModel | number | null>;
}

export interface GroupedDataDocumentModel extends CommonDocumentModel {
    items: Array<RawDataDocumentModel | number>;
}
