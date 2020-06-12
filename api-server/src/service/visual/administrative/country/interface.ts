import { CommonApiModel, CommonDocumentModel } from '@service/interface';

export interface VisualAdministrativeCountryDocumentModel
    extends CommonDocumentModel {
    name: string;
    code: string;
    acreage: number;
}

export interface VisualAdministrativeCountryApiModel extends CommonApiModel {
    name: string | null;
    code: string | null;
    acreage: number | null;
}
