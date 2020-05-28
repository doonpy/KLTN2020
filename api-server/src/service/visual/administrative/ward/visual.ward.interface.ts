import { CommonApiModel, CommonDocumentModel } from '@common/service/common.service.interface';
import { VisualDistrictDocumentModel, VisualizationDistrictApiModel } from '../district/visual.district.interface';
import { VisualCommonLogicInterface } from '../../visual.common.interface';

export interface VisualWardDocumentModel extends CommonDocumentModel {
    name: string;
    code: string;
    districtId: number | VisualDistrictDocumentModel;
}

export interface VisualWardApiModel extends CommonApiModel {
    name: string | null;
    code: string | null;
    district?: VisualizationDistrictApiModel | number | null;
}

export interface VisualWardLogicInterface extends VisualCommonLogicInterface {
    /**
     * @param {VisualWardDocumentModel} document
     *
     * @return {VisualWardDocumentModel}
     */
    populateDocument(document: VisualWardDocumentModel): Promise<VisualWardDocumentModel>;
}
