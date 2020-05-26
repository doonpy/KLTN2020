import { CommonApiModel, CommonDocumentModel } from '../../../../common/service/common.service.interface';
import {
    VisualizationDistrictApiModel,
    VisualizationDistrictDocumentModel,
} from '../district/visualization.district.interface';
import { VisualizationCommonLogicInterface } from '../../visualization.common.interface';

export interface VisualizationWardDocumentModel extends CommonDocumentModel {
    name: string;
    code: string;
    districtId: number | VisualizationDistrictDocumentModel;
}

export interface VisualizationWardApiModel extends CommonApiModel {
    name: string | null;
    code: string | null;
    district?: VisualizationDistrictApiModel | number | null;
}

export interface VisualizationWardLogicInterface extends VisualizationCommonLogicInterface {
    /**
     * @param {VisualizationWardDocumentModel} document
     *
     * @return {VisualizationWardDocumentModel}
     */
    populateDocument(document: VisualizationWardDocumentModel): Promise<VisualizationWardDocumentModel>;
}
