import { DocumentQuery, Query } from 'mongoose';
import CoordinateModel from './coordinate.model';
import { CoordinateApiModel, CoordinateDocumentModel, CoordinateLogicInterface } from './coordinate.interface';
import ExternalApi from '../../util/external-api/external-api';
import CommonServiceLogicBase from '../../common/service/common.service.logic.base';
import ResponseStatusCode from '../../common/common.response-status.code';
import CommonServiceWording from '../../common/service/common.service.wording';
import CoordinateWording from './coordinate.wording';

export default class CoordinateLogic extends CommonServiceLogicBase implements CoordinateLogicInterface {
    private static instance: CoordinateLogic;

    /**
     * @return {CoordinateLogic}
     */
    public static getInstance(): CoordinateLogic {
        if (!this.instance) {
            this.instance = new CoordinateLogic();
        }

        return this.instance;
    }

    /**
     * @param {number | undefined} limit
     * @param {number | undefined} offset
     * @param {object | undefined} conditions
     * @param {boolean | undefined} isPopulate
     */
    public async getAll(
        limit?: number,
        offset?: number,
        conditions?: object,
        isPopulate?: boolean
    ): Promise<{ documents: CoordinateDocumentModel[]; hasNext: boolean }> {
        const coordinateQuery: DocumentQuery<
            CoordinateDocumentModel[],
            CoordinateDocumentModel,
            object
        > = CoordinateModel.find(conditions || {});
        const remainCoordinateQuery: Query<number> = CoordinateModel.countDocuments(conditions || {});

        if (offset) {
            coordinateQuery.skip(offset);
            remainCoordinateQuery.skip(offset);
        }

        if (limit) {
            coordinateQuery.limit(limit);
        }

        const coordinates: CoordinateDocumentModel[] = await coordinateQuery.exec();
        const remainCatalog: number = await remainCoordinateQuery.exec();

        return { documents: coordinates, hasNext: coordinates.length < remainCatalog };
    }

    /**
     * @param {number} id
     *
     * @return {Promise<CoordinateDocumentModel>}
     */
    public async getById(id: number): Promise<CoordinateDocumentModel> {
        return (await CoordinateModel.findById(id).exec()) as CoordinateDocumentModel;
    }

    /**
     * @param {string} location
     *
     * @return Promise<CoordinateDocumentModel>
     */
    public async getByLocation(location: string): Promise<CoordinateDocumentModel> {
        location = location.trim();
        return (await CoordinateModel.findOne({ location }).exec()) as CoordinateDocumentModel;
    }

    /**
     * @param {CoordinateDocumentModel} location
     *
     * @return Promise<CoordinateDocumentModel>
     */
    public async create({ location }: CoordinateDocumentModel): Promise<CoordinateDocumentModel> {
        const {
            lat,
            lng,
        }: {
            lat: number;
            lng: number;
        } = await ExternalApi.getInstance().getCoordinateFromAddress(location);

        return await new CoordinateModel({ location: location.trim(), lat, lng }).save();
    }

    /**
     * @param {number} id
     * @param {CoordinateDocumentModel}
     *
     * @return <Promise<CoordinateDocumentModel>
     */
    public async update(id: number, { location, lat, lng }: CoordinateDocumentModel): Promise<CoordinateDocumentModel> {
        const coordinate: CoordinateDocumentModel = await this.getById(id);
        location = location.trim();

        coordinate.location = location.trim() || coordinate.location;
        coordinate.lat = lat || coordinate.lat;
        coordinate.lng = lng || coordinate.lng;

        return await coordinate.save();
    }

    /**
     * @param {number} id
     *
     * @return {Promise<void>}
     */
    public async delete(id: number): Promise<void> {
        await CoordinateModel.findByIdAndDelete(id);
    }

    /**
     * @param {string} location
     *
     * @return {Promise<boolean>}
     */
    public async isExistsWithLocation(location: string): Promise<boolean> {
        const result: number = await CoordinateModel.countDocuments({
            location: location.trim(),
        }).exec();

        return result !== 0;
    }

    /**
     *
     * @param {string} location
     * @param {boolean | undefined} isNot
     *
     * @return {Promise<void>}
     */
    public async checkExistsWithLocation(location: string, isNot?: boolean): Promise<void> {
        const isExists: boolean = await this.isExistsWithLocation(location);

        if (isNot) {
            if (isExists) {
                throw {
                    statusCode: ResponseStatusCode.BAD_REQUEST,
                    cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_2, value: [CoordinateWording.CDN_2] },
                    message: {
                        wording: CommonServiceWording.MESSAGE.MSG_CM_SER_2,
                        value: [CoordinateWording.CDN_2, CoordinateWording.CDN_3, location],
                    },
                };
            }
        } else if (!isExists) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_1, value: [CoordinateWording.CDN_2] },
                message: {
                    wording: CommonServiceWording.MESSAGE.MSG_CM_SER_1,
                    value: [CoordinateWording.CDN_2, CoordinateWording.CDN_3, location],
                },
            };
        }
    }

    /**
     * @param {number} id
     * @param {boolean | undefined} isNot
     *
     * @return {Promise<void>}
     */
    public async checkExistsWithId(id: number | CoordinateDocumentModel, isNot?: boolean): Promise<void> {
        const isExists: boolean = await this.isExistsWithId(id);

        if (isNot) {
            if (isExists) {
                throw {
                    statusCode: ResponseStatusCode.BAD_REQUEST,
                    cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_2, value: [CoordinateWording.CDN_2] },
                    message: {
                        wording: CommonServiceWording.MESSAGE.MSG_CM_SER_2,
                        value: [CoordinateWording.CDN_2, CoordinateWording.CDN_1, id],
                    },
                };
            }
        } else if (!isExists) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_1, value: [CoordinateWording.CDN_2] },
                message: {
                    wording: CommonServiceWording.MESSAGE.MSG_CM_SER_1,
                    value: [CoordinateWording.CDN_2, CoordinateWording.CDN_1, id],
                },
            };
        }
    }

    /**
     * @param {number} id
     *
     * @return {boolean}
     */
    public async isExistsWithId(id: number | CoordinateDocumentModel): Promise<boolean> {
        if (typeof id === 'object') {
            id = id._id;
        }
        const result: number = await CoordinateModel.countDocuments({
            _id: id,
        }).exec();

        return result !== 0;
    }

    /**
     * @param {CoordinateDocumentModel}
     * @param {number} languageIndex
     *
     * @return {CoordinateApiModel}
     */
    public convertToApiResponse(
        { _id, location, lat, lng, cTime, mTime }: CoordinateDocumentModel,
        languageIndex = 0
    ): CoordinateApiModel {
        const data: CoordinateApiModel = {
            id: null,
            location: null,
            lat: null,
            lng: null,
            createAt: null,
            updateAt: null,
        };

        if (_id) {
            data.id = _id;
        }

        if (location) {
            data.location = location;
        }

        if (lat) {
            data.lat = lat;
        }

        if (lng) {
            data.lng = lng;
        }

        if (cTime) {
            data.createAt = cTime;
        }

        if (mTime) {
            data.updateAt = mTime;
        }

        return data;
    }
}
