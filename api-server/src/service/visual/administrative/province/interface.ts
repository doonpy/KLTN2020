import { CommonApiModel, CommonDocumentModel } from '@common/service/interface';
import {
    VisualAdministrativeCountryApiModel,
    VisualAdministrativeCountryDocumentModel,
} from '../country/interface';

export interface VisualAdministrativeProvinceDocumentModel
    extends CommonDocumentModel {
    name: string;
    code: string;
    countryId: number | VisualAdministrativeCountryDocumentModel;
    acreage: number;
}

export interface VisualAdministrativeProvinceApiModel extends CommonApiModel {
    name: string | null;
    code: string | null;
    country: number | VisualAdministrativeCountryApiModel | null;
    acreage: number | null;
}
