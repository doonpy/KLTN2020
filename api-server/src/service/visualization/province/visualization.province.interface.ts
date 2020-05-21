import { CommonApiModel, CommonDocumentModel } from '../../../common/service/common.service.interface';

export interface VisualizationProvinceDocumentModel extends CommonDocumentModel {
    name: string;
    code: string;
    acreage: number;
}

export interface VisualizationProvinceApiModel extends CommonApiModel {
    name: string | null;
    code: string | null;
    acreage: number | null;
}
