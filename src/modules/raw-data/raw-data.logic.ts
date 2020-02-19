import RawDataModel from './raw-data.model';
import { Document } from 'mongoose';
import CustomizeException from '../exception/customize.exception';
import { Constant } from '../../util/definition/constant';
import { Cause } from '../../util/definition/error/cause';
import async, { Dictionary } from 'async';
import DetailUrlModel from '../detail-url/detail-url.model';
import DetailUrlLogic from '../detail-url/detail-url.logic';
import { RawDataErrorMessage } from './raw-data.error-message';
import { RawDataConstant } from './raw-data.constant';

class RawDataLogic {
    /**
     * @param limit
     * @param offset
     * @param detailUrlId
     *
     * @return Promise<{ rawDataList: Array<object>; hasNext: boolean }>
     */
    public getAll = (
        limit: number,
        offset: number,
        detailUrlId: number
    ): Promise<{ rawDataList: Array<object>; hasNext: boolean }> => {
        return new Promise((resolve: any, reject: any): void => {
            RawDataModel.find({ detailUrlId: detailUrlId || { $gt: 0 } })
                .populate({
                    path: 'detailUrlId',
                    populate: {
                        path: 'catalogId',
                        populate: { path: 'hostId' },
                    },
                })
                .skip(offset)
                .exec((error: Error, rawDataset: Array<Document>): void => {
                    if (error) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                error.message,
                                Cause.DATABASE
                            )
                        );
                    }

                    let rawDataList: Array<object> = [];
                    for (let i: number = 0; i < rawDataset.length && i < limit; i++) {
                        rawDataList.push(RawDataLogic.convertToResponse(rawDataset[i]));
                    }

                    let hasNext: boolean = rawDataList.length < rawDataset.length;

                    resolve({ rawDataList: rawDataList, hasNext: hasNext });
                });
        });
    };

    /**
     * @param id
     *
     * @return Promise<object>
     */
    public getById = (id: string): Promise<object> => {
        return new Promise((resolve: any, reject: any): void => {
            RawDataModel.findById(id)
                .populate({
                    path: 'detailUrlId',
                    populate: {
                        path: 'catalogId',
                        populate: { path: 'hostId' },
                    },
                })
                .exec((error: Error, rawData: Document | null): void => {
                    if (error) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                error.message,
                                Cause.DATABASE
                            )
                        );
                    }

                    if (!rawData) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                RawDataErrorMessage.RD_ERROR_1,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['id', id]
                            )
                        );
                    }

                    resolve(RawDataLogic.convertToResponse(rawData));
                });
        });
    };

    /**
     * @param requestBody
     *
     * @return Promise<object>
     */
    public create = ({
        detailUrlId,
        transactionType,
        propertyType,
        title,
        price,
        acreage,
        address,
        others = [],
    }: {
        detailUrlId: number;
        transactionType: number;
        propertyType: number;
        title: string;
        price: {
            value: number;
            currency: string;
        };
        acreage: {
            value: number;
            measureUnit: string;
        };
        address: {
            city: string;
            district: string;
            ward: string;
            street: string;
        };
        others:
            | Array<{
                  name: string;
                  value: string;
              }>
            | Array<null>;
    }): Promise<object> => {
        return new Promise((resolve: any, reject: any): void => {
            async.parallel(
                {
                    isRawDataExisted: (callback: any): void => {
                        RawDataModel.countDocuments({
                            detailUrlId: detailUrlId,
                        }).exec(callback);
                    },
                    isDetailUrlExisted: (callback: any): void => {
                        DetailUrlModel.countDocuments({
                            _id: detailUrlId,
                        }).exec(callback);
                    },
                },
                (
                    error: Error | undefined,
                    {
                        isRawDataExisted,
                        isDetailUrlExisted,
                    }: Dictionary<
                        | any
                        | {
                              isRawDataExisted: number;
                              isDetailUrlExisted: number;
                          }
                    >
                ): void => {
                    if (error) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                error.message,
                                Cause.DATABASE
                            )
                        );
                    }

                    if (isRawDataExisted) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                RawDataErrorMessage.RD_ERROR_2,
                                Cause.DATA_VALUE.EXISTS,
                                ['detailUrlId', detailUrlId]
                            )
                        );
                    }

                    if (!isDetailUrlExisted) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                RawDataErrorMessage.RD_ERROR_3,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['detailUrlId', detailUrlId]
                            )
                        );
                    }

                    new RawDataModel({
                        detailUrlId: detailUrlId,
                        transactionType: transactionType,
                        propertyType: propertyType,
                        title: title,
                        price: price,
                        acreage: acreage,
                        address: address,
                        others: others,
                    }).save(
                        async (error: Error, createdRawData: Document | any): Promise<void> => {
                            if (error) {
                                return reject(
                                    new CustomizeException(
                                        Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                        error.message,
                                        Cause.DATABASE
                                    )
                                );
                            }

                            await createdRawData
                                .populate({
                                    path: 'detailUrlId',
                                    populate: {
                                        path: 'catalogId',
                                        populate: { path: 'hostId' },
                                    },
                                })
                                .execPopulate();

                            resolve(RawDataLogic.convertToResponse(createdRawData));
                        }
                    );
                }
            );
        });
    };

    /**
     * @param id
     * @param requestBody
     *
     * @return Promise<>
     */
    public update = (
        id: string,
        {
            detailUrlId,
            transactionType,
            propertyType,
            title,
            price,
            acreage,
            address,
            others = [],
        }: {
            detailUrlId: number;
            transactionType: number;
            propertyType: number;
            title: string;
            price: {
                value: number;
                currency: string;
            };
            acreage: {
                value: number;
                measureUnit: string;
            };
            address: {
                city: string;
                district: string;
                ward: string;
                street: string;
            };
            others:
                | Array<{
                      name: string;
                      value: string;
                  }>
                | Array<null>;
        }
    ): Promise<object> => {
        return new Promise((resolve: any, reject: any): void => {
            async.parallel(
                {
                    rawData: (callback: any): void => {
                        RawDataModel.findById(id).exec(callback);
                    },
                    isRawDataExisted: (callback: any): void => {
                        RawDataModel.countDocuments({
                            detailUrlId: detailUrlId,
                        }).exec(callback);
                    },
                    isDetailUrlExisted: (callback: any): void => {
                        DetailUrlModel.countDocuments({
                            _id: detailUrlId,
                        }).exec(callback);
                    },
                },
                (
                    error: Error | undefined,
                    {
                        rawData,
                        isRawDataExisted,
                        isDetailUrlExisted,
                    }: Dictionary<
                        | any
                        | {
                              rawData: Document | null;
                              isRawDataExisted: number;
                              isDetailUrlExisted: number;
                          }
                    >
                ): void => {
                    if (error) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                error.message,
                                Cause.DATABASE
                            )
                        );
                    }

                    if (!rawData) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                RawDataErrorMessage.RD_ERROR_1,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['id', id]
                            )
                        );
                    }

                    if (!isDetailUrlExisted) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                RawDataErrorMessage.RD_ERROR_3,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['detailUrlId', detailUrlId]
                            )
                        );
                    }

                    if (isRawDataExisted && detailUrlId === rawData.detailUrlId) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                RawDataErrorMessage.RD_ERROR_2,
                                Cause.DATA_VALUE.EXISTS,
                                ['detailUrlId', detailUrlId]
                            )
                        );
                    }

                    rawData.detailUrlId = detailUrlId || rawData.detailUrlId;
                    rawData.transactionType =
                        typeof transactionType !== 'undefined' ? transactionType : rawData.transactionType;
                    rawData.propertyType = typeof propertyType !== 'undefined' ? propertyType : rawData.propertyType;
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
                    }

                    if (others && others.length > 0) {
                        others.forEach((other: { name: string; value: string } | any): void => {
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

                    rawData.save(
                        async (error: Error, editedRawData: Document | any): Promise<void> => {
                            if (error) {
                                new CustomizeException(
                                    Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                    error.message,
                                    Cause.DATABASE
                                );
                            }

                            await editedRawData
                                .populate({
                                    path: 'detailUrlId',
                                    populate: {
                                        path: 'catalogId',
                                        populate: { path: 'hostId' },
                                    },
                                })
                                .execPopulate();

                            resolve(RawDataLogic.convertToResponse(editedRawData));
                        }
                    );
                }
            );
        });
    };

    /**
     * @param id
     *
     * @return Promise<null>
     */
    public delete = (id: string): Promise<null> => {
        return new Promise((resolve: any, reject: any): void => {
            RawDataModel.findById(id).exec((error: Error, rawData: Document | null): void => {
                if (error) {
                    return reject(
                        new CustomizeException(
                            Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                            error.message,
                            Cause.DATABASE
                        )
                    );
                }

                if (!rawData) {
                    return reject(
                        new CustomizeException(
                            Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                            RawDataErrorMessage.RD_ERROR_1,
                            Cause.DATA_VALUE.NOT_FOUND,
                            ['id', id]
                        )
                    );
                }

                RawDataModel.findByIdAndDelete(id, (error: Error): void => {
                    if (error) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                error.message,
                                Cause.DATABASE
                            )
                        );
                    }

                    resolve();
                });
            });
        });
    };

    /**
     * @param rawData
     */

    private static convertToResponse({
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
        address: { city: string; district: string; ward: string; street: string } | object;
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
            address: { city: string; district: string; ward: string; street: string } | object;
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
                RawDataConstant.DEFINITION.TYPE_OF_TRANSACTION[transactionType][Constant.LANGUAGE] || '';
        }

        if (typeof propertyType !== 'undefined') {
            data.propertyType = RawDataConstant.DEFINITION.TYPE_OF_PROPERTY[propertyType][Constant.LANGUAGE] || '';
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
