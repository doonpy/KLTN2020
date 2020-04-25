import {
    CommonApiModel,
    CommonDocumentModel,
    CommonLogicBaseInterface,
} from '../../common/service/common.service.interface';

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

export interface CoordinateLogicInterface extends CommonLogicBaseInterface {
    /**
     * @param {string} location
     *
     * @return {Promise<CoordinateDocumentModel>}
     */
    getByLocation(location: string): Promise<CoordinateDocumentModel>;

    /**
     * @param {string} location
     *
     * @return {Promise<boolean>}
     */
    isExistsWithLocation(location: string): Promise<boolean>;

    /**
     * @param {string} location
     * @param {boolean | undefined} isNot
     *
     * @return {Promise<void>}
     */
    checkExistsWithLocation(location: string, isNot?: boolean): Promise<void>;
}
