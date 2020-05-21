import { CommonDocumentModel } from '../../../common/service/common.service.interface';
import { VisualizationProvinceApiModel } from '../province/visualization.province.interface';

export interface VisualizationDistrictDocumentModel extends CommonDocumentModel {
    name: string;
    code: string;
    acreage: number;
    provinceId: number;
}

export interface VisualizationDistrictApiModel {
    name: string | null;
    code: string | null;
    acreage: number | null;
    province?: VisualizationProvinceApiModel | number | null;
}
