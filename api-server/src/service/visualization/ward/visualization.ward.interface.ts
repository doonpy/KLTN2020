import { CommonDocumentModel } from '../../../common/service/common.service.interface';
import { VisualizationDistrictApiModel } from '../district/visualization.district.interface';

export interface VisualizationWardDocumentModel extends CommonDocumentModel {
    name: string;
    code: string;
    districtId: number;
}

export interface VisualizationWardApiModel {
    name: string | null;
    code: string | null;
    district?: VisualizationDistrictApiModel | number | null;
}
