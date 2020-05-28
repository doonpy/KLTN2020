import { CommonApiModel, CommonDocumentModel } from '@common/service/common.service.interface';
import { VisualCountryApiModel, VisualCountryDocumentModel } from '../country/visual.country.interface';
import { VisualCommonLogicInterface } from '../../visual.common.interface';

export interface VisualProvinceDocumentModel extends CommonDocumentModel {
    name: string;
    code: string;
    countryId: number | VisualCountryDocumentModel;
    acreage: number;
}

export interface VisualProvinceApiModel extends CommonApiModel {
    name: string | null;
    code: string | null;
    country: number | VisualCountryApiModel | null;
    acreage: number | null;
}

export interface VisualizationProvinceLogicInterface extends VisualCommonLogicInterface {
    /**
     * @param {VisualProvinceDocumentModel} document
     *
     * @return {VisualProvinceDocumentModel}
     */
    populateDocument(document: VisualProvinceDocumentModel): Promise<VisualProvinceDocumentModel>;
}
