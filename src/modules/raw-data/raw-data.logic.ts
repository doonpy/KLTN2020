import RawDataModel from './raw-data.model';
import CustomizeException from '../exception/customize.exception';
import { Constant } from '../../util/definition/constant';
import { Cause } from '../../util/definition/error/cause';
import async, { Dictionary } from 'async';
import DetailUrlModel from '../detail-url/detail-url.model';
import DetailUrlLogic from '../detail-url/detail-url.logic';
import { RawDataErrorMessage } from './raw-data.error-message';
import { RawDataConstant } from './raw-data.constant';
import RawDataModelInterface from './raw-data.model.interface';
import { DocumentQuery, Query } from 'mongoose';
import DetailUrlModelInterface from '../detail-url/detail-url.model.interface';

class RawDataLogic {
    /**
     * @param limit
     * @param offset
     * @param detailUrlId
     *
     * @return Promise<{ rawDataset: Array<RawDataModelInterface>; hasNext: boolean }>
     */
    public async getAll(
        limit: number,
        offset: number,
        detailUrlId: number
    ): Promise<{ rawDataset: Array<RawDataModelInterface>; hasNext: boolean }> {
        try {
            let conditions: object = {};
            let rawDatasetQuery: DocumentQuery<
                Array<RawDataModelInterface>,
                RawDataModelInterface,
                object
            > = RawDataModel.find(conditions).populate({
                path: 'detailUrlId',
                populate: {
                    path: 'catalogId',
                    populate: { path: 'hostId' },
                },
            });
            let remainRawDatasetQuery: Query<number> = RawDataModel.countDocuments(conditions);

            if (offset) {
                rawDatasetQuery.skip(offset);
                remainRawDatasetQuery.skip(offset);
            }

            if (limit) {
                rawDatasetQuery.limit(limit);
            }

            let rawDataset: Array<RawDataModelInterface> = await rawDatasetQuery.exec();
            let remainRawDataset = await remainRawDatasetQuery.exec();

            return {
                rawDataset: rawDataset,
                hasNext: rawDataset.length < remainRawDataset,
            };
        } catch (error) {
            throw new CustomizeException(
                error.statusCode || Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Cause.DATABASE
            );
        }
    }

    /**
     * @param id
     *
     * @return Promise<RawDataModelInterface>
     */
    public async getById(id: string | number): Promise<RawDataModelInterface | null> {
        try {
            await RawDataLogic.checkRawDataExistedWithId(id);

            return await RawDataModel.findById(id)
                .populate({
                    path: 'detailUrlId',
                    populate: {
                        path: 'catalogId',
                        populate: { path: 'hostId' },
                    },
                })
                .exec();
        } catch (error) {
            throw new CustomizeException(
                error.statusCode || Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Cause.DATABASE
            );
        }
    }

    /**
     * @param requestBody
     *
     * @return Promise<RawDataModelInterface>
     */
    public async create({
        detailUrlId,
        transactionType,
        propertyType,
        title,
        price,
        acreage,
        address,
        others,
    }: RawDataModelInterface): Promise<RawDataModelInterface> {
        try {
            await DetailUrlLogic.checkDetailUrlExistedWithId(detailUrlId);
            await RawDataLogic.checkRawDataExistedWithDetailUrlId(detailUrlId);

            return await (
                await new RawDataModel({
                    detailUrlId: detailUrlId,
                    transactionType: transactionType,
                    propertyType: propertyType,
                    title: title,
                    price: price,
                    acreage: acreage,
                    address: address,
                    others: others,
                }).save()
            )
                .populate({
                    path: 'detailUrlId',
                    populate: {
                        path: 'catalogId',
                        populate: { path: 'hostId' },
                    },
                })
                .execPopulate();
        } catch (error) {
            throw new CustomizeException(
                error.statusCode || Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Cause.DATABASE
            );
        }
    }

    /**
     * @param id
     * @param requestBody
     *
     * @return Promise<RawDataModelInterface>
     */
    public async update(
        id: string | number,
        {
            detailUrlId,
            transactionType,
            propertyType,
            title,
            price,
            acreage,
            address,
            others,
        }: RawDataModelInterface
    ): Promise<RawDataModelInterface | undefined> {
        try {
            await DetailUrlLogic.checkDetailUrlExistedWithId(detailUrlId);
            await RawDataLogic.checkRawDataExistedWithId(id);

            let rawData: RawDataModelInterface | null = await RawDataModel.findById(id).exec();
            if (!rawData) {
                return;
            }

            if (rawData.detailUrlId !== detailUrlId) {
                await DetailUrlLogic.checkDetailUrlExistedWithId(detailUrlId);
                await RawDataLogic.checkRawDataExistedWithDetailUrlId(detailUrlId);
            }

            rawData.detailUrlId = detailUrlId || rawData.detailUrlId;
            rawData.transactionType =
                typeof transactionType !== 'undefined' ? transactionType : rawData.transactionType;
            rawData.propertyType =
                typeof propertyType !== 'undefined' ? propertyType : rawData.propertyType;
            rawData.title = title || rawData.title;

            if (price && Object.keys(price).length > 0) {
                rawData.price.value = price.value || rawData.price.value;
                rawData.price.currency = price.currency || rawData.price.currency;
            }

            if (acreage && Object.keys(acreage).length > 0) {
                rawData.acreage.value = acreage.value || rawData.acreage.value;
                rawData.acreage.measureUnit = acreage.measureUnit || rawData.acreage.measureUnit;
            }

            if (address && Object.keys(address).length > 0) {
                rawData.address.city = address.city || rawData.address.city;
                rawData.address.district = address.district || rawData.address.district;
                rawData.address.ward = address.ward || rawData.address.ward;
                rawData.address.street = address.street || rawData.address.street;
                rawData.address.project = address.project || rawData.address.project;
            }

            if (others && others.length > 0) {
                others.forEach((other: { name: string; value: string } | any): void => {
                    if (!rawData) {
                        return;
                    }

                    let otherSimilarIndex = rawData.others.findIndex(
                        (o: { name: string; value: string }): boolean => {
                            return o.name === other.name;
                        }
                    );
                    if (otherSimilarIndex >= 0) {
                        rawData.others[otherSimilarIndex] = other;
                    }
                });
            }

            return await (await rawData.save())
                .populate({
                    path: 'detailUrlId',
                    populate: {
                        path: 'catalogId',
                        populate: { path: 'hostId' },
                    },
                })
                .execPopulate();
        } catch (error) {
            throw new CustomizeException(
                error.statusCode || Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Cause.DATABASE
            );
        }
    }

    /**
     * @param id
     *
     * @return Promise<null>
     */
    public async delete(id: string): Promise<null> {
        try {
            await RawDataLogic.checkRawDataExistedWithId(id);
            await RawDataModel.findByIdAndDelete(id).exec();

            return null;
        } catch (error) {
            throw new CustomizeException(
                error.statusCode || Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Cause.DATABASE
            );
        }
    }

    /**
     * @return index number
     */
    public static getPropertyTypeIndex(propertyTypeData: string): number {
        let index: number = RawDataConstant.DEFINITION.TYPE_OF_PROPERTY.findIndex(
            (property: Array<string>) =>
                new RegExp(property.join('|')).test(propertyTypeData.toLowerCase())
        );

        if (index === -1) {
            return RawDataConstant.TYPE_OF_PROPERTY.OTHER;
        }

        return index;
    }

    /**
     * @param id
     */
    public static async checkRawDataExistedWithId(
        id: RawDataModelInterface | number | string
    ): Promise<void> {
        if (typeof id === 'object') {
            id = id._id;
        }
        if ((await RawDataModel.countDocuments({ _id: id }).exec()) === 0) {
            new CustomizeException(
                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                RawDataErrorMessage.RD_ERROR_1,
                Cause.DATA_VALUE.NOT_FOUND,
                ['id', id]
            ).raise();
        }
    }

    /**
     * @param detailUrlId
     */
    public static async checkRawDataExistedWithDetailUrlId(
        detailUrlId: DetailUrlModelInterface | number | string
    ): Promise<void> {
        if (typeof detailUrlId === 'object') {
            detailUrlId = detailUrlId._id;
        }
        if ((await RawDataModel.countDocuments({ detailUrlId: detailUrlId }).exec()) === 0) {
            new CustomizeException(
                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                RawDataErrorMessage.RD_ERROR_2,
                Cause.DATA_VALUE.EXISTS,
                ['detailUrlId', detailUrlId]
            ).raise();
        }
    }

    /**
     * @param rawData
     */

    public static convertToResponse({
        _id,
        transactionType,
        propertyType,
        detailUrlId,
        title,
        price,
        acreage,
        address,
        others,
        cTime,
        mTime,
    }: any): {
        id: number;
        transactionType: string;
        propertyType: string;
        detailUrl: object;
        title: string;
        price: { value: number; currency: string } | object;
        acreage: { value: number; measureUnit: string } | object;
        address:
            | { city: string; district: string; ward: string; street: string; project: string }
            | object;
        others: Array<{ name: string; value: string }> | Array<any>;
        createAt: string;
        updateAt: string;
    } {
        let data: {
            id: number;
            transactionType: string;
            propertyType: string;
            detailUrl: object;
            title: string;
            price: { value: number; currency: string } | object;
            acreage: { value: number; measureUnit: string } | object;
            address:
                | { city: string; district: string; ward: string; street: string; project: string }
                | object;
            others: Array<{ name: string; value: string }> | Array<any>;
            createAt: string;
            updateAt: string;
        } = {
            id: NaN,
            transactionType: '',
            propertyType: '',
            detailUrl: {},
            title: '',
            price: {},
            acreage: {},
            address: {},
            others: [],
            createAt: '',
            updateAt: '',
        };

        if (_id) {
            data.id = _id;
        }

        if (typeof transactionType !== 'undefined') {
            data.transactionType =
                RawDataConstant.DEFINITION.TYPE_OF_TRANSACTION[transactionType][
                    Constant.LANGUAGE
                ] || '';
        }

        if (typeof propertyType !== 'undefined') {
            data.propertyType =
                RawDataConstant.DEFINITION.TYPE_OF_PROPERTY[propertyType][Constant.LANGUAGE] || '';
        }

        if (detailUrlId && Object.keys(detailUrlId).length > 0) {
            data.detailUrl = DetailUrlLogic.convertToResponse(detailUrlId);
        }

        if (title) {
            data.title = title;
        }

        if (Object.keys(price).length > 0) {
            data.price = price;
        }

        if (Object.keys(acreage).length > 0) {
            if (acreage.measureUnit) {
                acreage.measureUnit = decodeURI(acreage.measureUnit);
            }
            data.acreage = acreage;
        }

        if (Object.keys(address).length > 0) {
            data.address = address;
        }

        if (others.length > 0) {
            data.others = others;
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

export default RawDataLogic;
