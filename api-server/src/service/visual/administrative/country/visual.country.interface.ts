import { CommonApiModel, CommonDocumentModel } from '@common/service/common.service.interface';

export interface VisualCountryDocumentModel extends CommonDocumentModel {
    name: string;
    code: string;
    acreage: number;
}

export interface VisualCountryApiModel extends CommonApiModel {
    name: string | null;
    code: string | null;
    acreage: number | null;
}
