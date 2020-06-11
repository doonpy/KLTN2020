import { CommonApiModel, CommonDocumentModel } from '@common/service/interface';
import {
    VisualAdministrativeProvinceApiModel,
    VisualAdministrativeProvinceDocumentModel,
} from '../province/interface';

export interface VisualAdministrativeDistrictDocumentModel
    extends CommonDocumentModel {
    name: string;
    code: string;
    acreage: number;
    provinceId: number | VisualAdministrativeProvinceDocumentModel;
}

export interface VisualAdministrativeDistrictApiModel extends CommonApiModel {
    name: string | null;
    code: string | null;
    acreage: number | null;
    province?: VisualAdministrativeProvinceApiModel | number | null;
}
