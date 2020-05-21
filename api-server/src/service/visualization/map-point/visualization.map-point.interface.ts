import { CommonDocumentModel } from '../../../common/service/common.service.interface';

export interface VisualizationMapPointDocumentModel extends CommonDocumentModel {
    districtId: number;
    wardId: number;
    lat: number;
    lon: number;
    rawDataIdList: number[];
}
