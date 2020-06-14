import { ApiModelBase, DocumentModelBase } from '@service/interface';
import {
    VisualAdministrativeDistrictApiModel,
    VisualAdministrativeDistrictDocumentModel,
} from '../district/interface';

export interface VisualAdministrativeWardDocumentModel
    extends DocumentModelBase {
    name: string;
    code: string;
    districtId: number | VisualAdministrativeDistrictDocumentModel;
}

export interface VisualAdministrativeWardApiModel extends ApiModelBase {
    name: string | null;
    code: string | null;
    district?: VisualAdministrativeDistrictApiModel | number | null;
}
