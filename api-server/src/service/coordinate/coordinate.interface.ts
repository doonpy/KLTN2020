import {
    CommonApiModel,
    CommonDocumentModel,
    CommonLogicBaseInterface,
} from '@common/service/common.service.interface';

export interface CoordinateApiModel extends CommonApiModel {
    location: string | null;
    lat: number | null;
    lng: number | null;
}

export interface CoordinateDocumentModel extends CommonDocumentModel {
    location: string;
    lat: number;
    lng: number;
}

export interface CoordinateLogicInterface
    extends CommonLogicBaseInterface<
        CoordinateDocumentModel,
        CoordinateApiModel
    > {
    /**
     * @param {string} location
     *
     * @return {Promise<CoordinateDocumentModel>}
     */
    getByLocation(location: string): Promise<CoordinateDocumentModel>;
}
