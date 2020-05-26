import { CommonApiModel, CommonDocumentModel } from '../../../../common/service/common.service.interface';
import {
    VisualizationCountryApiModel,
    VisualizationCountryDocumentModel,
} from '../country/visualization.country.interface';
import { VisualizationCommonLogicInterface } from '../../visualization.common.interface';

export interface VisualizationProvinceDocumentModel extends CommonDocumentModel {
    name: string;
    code: string;
    countryId: number | VisualizationCountryDocumentModel;
    acreage: number;
}

export interface VisualizationProvinceApiModel extends CommonApiModel {
    name: string | null;
    code: string | null;
    country: number | VisualizationCountryApiModel | null;
    acreage: number | null;
}

export interface VisualizationProvinceLogicInterface extends VisualizationCommonLogicInterface {
    /**
     * @param {VisualizationProvinceDocumentModel} document
     *
     * @return {VisualizationProvinceDocumentModel}
     */
    populateDocument(document: VisualizationProvinceDocumentModel): Promise<VisualizationProvinceDocumentModel>;
}
