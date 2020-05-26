import { CommonApiModel, CommonDocumentModel } from '../../../../common/service/common.service.interface';
import {
    VisualizationProvinceApiModel,
    VisualizationProvinceDocumentModel,
} from '../province/visualization.province.interface';
import { VisualizationCommonLogicInterface } from '../../visualization.common.interface';

export interface VisualizationDistrictDocumentModel extends CommonDocumentModel {
    name: string;
    code: string;
    acreage: number;
    provinceId: number | VisualizationProvinceDocumentModel;
}

export interface VisualizationDistrictApiModel extends CommonApiModel {
    name: string | null;
    code: string | null;
    acreage: number | null;
    province?: VisualizationProvinceApiModel | number | null;
}

export interface VisualizationDistrictLogicInterface extends VisualizationCommonLogicInterface {
    /**
     * @param {VisualizationDistrictDocumentModel} document
     *
     * @return {VisualizationDistrictDocumentModel}
     */
    populateDocument(document: VisualizationDistrictDocumentModel): Promise<VisualizationDistrictDocumentModel>;
}
