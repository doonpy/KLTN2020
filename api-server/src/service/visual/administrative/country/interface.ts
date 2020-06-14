import { ApiModelBase, DocumentModelBase } from '@service/interface';

export interface VisualAdministrativeCountryDocumentModel
    extends DocumentModelBase {
    name: string;
    code: string;
    acreage: number;
}

export interface VisualAdministrativeCountryApiModel extends ApiModelBase {
    name: string | null;
    code: string | null;
    acreage: number | null;
}
