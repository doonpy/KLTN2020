import { CommonApiModel, CommonDocumentModel } from '../../../../common/service/common.service.interface';

export interface VisualizationCountryDocumentModel extends CommonDocumentModel {
    name: string;
    code: string;
    acreage: number;
}

export interface VisualizationCountryApiModel extends CommonApiModel {
    name: string | null;
    code: string | null;
    acreage: number | null;
}
