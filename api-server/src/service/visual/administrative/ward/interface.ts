import { CommonApiModel, CommonDocumentModel } from '@common/service/interface';
import {
    VisualAdministrativeDistrictApiModel,
    VisualAdministrativeDistrictDocumentModel,
} from '../district/interface';

export interface VisualAdministrativeWardDocumentModel
    extends CommonDocumentModel {
    name: string;
    code: string;
    districtId: number | VisualAdministrativeDistrictDocumentModel;
}

export interface VisualAdministrativeWardApiModel extends CommonApiModel {
    name: string | null;
    code: string | null;
    district?: VisualAdministrativeDistrictApiModel | number | null;
}
