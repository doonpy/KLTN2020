import { ApiModelBase, DocumentModelBase } from '@service/interface';
import { RawDataApiModel, RawDataDocumentModel } from '../raw-data/interface';

export interface GroupedDataApiModel extends ApiModelBase {
    items: Array<RawDataApiModel | number | null>;
}

export interface GroupedDataDocumentModel extends DocumentModelBase {
    items: Array<RawDataDocumentModel | number>;
}
