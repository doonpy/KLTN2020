import { CommonApiModel, CommonDocumentModel } from '@common/service/common.service.interface';
import { VisualProvinceApiModel, VisualProvinceDocumentModel } from '../province/visual.province.interface';
import { VisualCommonLogicInterface } from '../../visual.common.interface';

export interface VisualDistrictDocumentModel extends CommonDocumentModel {
    name: string;
    code: string;
    acreage: number;
    provinceId: number | VisualProvinceDocumentModel;
}

export interface VisualizationDistrictApiModel extends CommonApiModel {
    name: string | null;
    code: string | null;
    acreage: number | null;
    province?: VisualProvinceApiModel | number | null;
}

export interface VisualDistrictLogicInterface extends VisualCommonLogicInterface {
    /**
     * @param {VisualDistrictDocumentModel} document
     *
     * @return {VisualDistrictDocumentModel}
     */
    populateDocument(document: VisualDistrictDocumentModel): Promise<VisualDistrictDocumentModel>;
}
