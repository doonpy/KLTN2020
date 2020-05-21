import { CommonDocumentModel } from '../../common/service/common.service.interface';

export interface TempDocumentModel extends CommonDocumentModel {
    rawDataId: number;
    address: string;
    houseNumber: string;
    street: string;
    ward: string;
    district: string;
    province: string;
    country: string;
    lat: number;
    lon: number;
    isValid: boolean;
    matchPercentage: number;
}
