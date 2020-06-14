import { ApiModelBase, DocumentModelBase } from '@service/interface';
import {
    VisualAdministrativeCountryApiModel,
    VisualAdministrativeCountryDocumentModel,
} from '../country/interface';

export interface VisualAdministrativeProvinceDocumentModel
    extends DocumentModelBase {
    name: string;
    code: string;
    countryId: number | VisualAdministrativeCountryDocumentModel;
    acreage: number;
}

export interface VisualAdministrativeProvinceApiModel extends ApiModelBase {
    name: string | null;
    code: string | null;
    country: number | VisualAdministrativeCountryApiModel | null;
    acreage: number | null;
}
