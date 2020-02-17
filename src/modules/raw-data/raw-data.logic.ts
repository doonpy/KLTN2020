import RawDataModel from './raw-data.model';
import { Document } from 'mongoose';
import CustomizeException from '../exception/customize.exception';
import { Constant } from '../../util/definition/constant';
import { Cause } from '../../util/definition/error/cause';
import async, { Dictionary } from 'async';
import DetailUrlModel from '../detail-url/detail-url.model';
import DetailUrlLogic from '../detail-url/detail-url.logic';
import { RawDataErrorMessage } from './raw-data.error-message';

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
                    for (
                        let i: number = 0;
                        i < rawDataset.length && i < limit;
                        i++
                    ) {
                        rawDataList.push(
                            DetailUrlLogic.convertToResponse(rawDataset[i])
                        );
                    }

                    let hasNext: boolean =
                        rawDataList.length < rawDataset.length;

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
        title,
        price,
        acreage,
        address,
        others = [],
    }: {
        detailUrlId: number;
        title: string;
        price: number;
        acreage: string;
        address: string;
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
                    detailUrl: (callback: any): void => {
                        DetailUrlModel.findById(detailUrlId)
                            .populate({
                                path: 'catalogId',
                                populate: { path: 'hostId' },
                            })
                            .exec(callback);
                    },
                },
                (
                    error: Error | undefined,
                    {
                        isRawDataExisted,
                        detailUrl,
                    }: Dictionary<
                        | any
                        | {
                              isRawDataExisted: number;
                              detailUrl: Document;
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
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['detailUrlId', detailUrlId]
                            )
                        );
                    }

                    if (!detailUrl) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                RawDataErrorMessage.RD_ERROR_3,
                                Cause.DATA_VALUE.EXISTS,
                                ['detailUrlId', detailUrlId]
                            )
                        );
                    }

                    new RawDataModel({
                        detailUrlId: detailUrlId,
                        title: title,
                        price: price,
                        acreage: acreage,
                        address: address,
                        others: others,
                    }).save(
                        (
                            error: Error,
                            createdRawData: Document | any
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

                            createdRawData.detailUrlId = detailUrl;
                            resolve(
                                RawDataLogic.convertToResponse(createdRawData)
                            );
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
            title,
            price,
            acreage,
            address,
            others = [],
        }: {
            detailUrlId: number;
            title: string;
            price: number;
            acreage: string;
            address: string;
            others:
                | Array<{
                      name: string;
                      value: string;
                  }>
                | Array<any>;
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
                    detailUrl: (callback: any): void => {
                        if (detailUrlId) {
                            DetailUrlModel.findById(detailUrlId)
                                .populate({
                                    path: 'catalogId',
                                    populate: { path: 'hostId' },
                                })
                                .exec(callback);
                        } else {
                            callback();
                        }
                    },
                },
                (
                    error: Error | undefined,
                    {
                        rawData,
                        isRawDataExisted,
                        detailUrl,
                    }: Dictionary<
                        | any
                        | {
                              rawData: Document | null;
                              isRawDataExisted: number;
                              detailUrl: Document | null;
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

                    if (!detailUrl && detailUrlId) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                RawDataErrorMessage.RD_ERROR_3,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['detailUrlId', detailUrlId]
                            )
                        );
                    }

                    if (
                        isRawDataExisted &&
                        detailUrlId !== rawData.detailUrlId
                    ) {
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
                    rawData.title = title || rawData.title;
                    rawData.price = price || rawData.price;
                    rawData.acreage = acreage || rawData.acreage;
                    rawData.address = address || rawData.address;
                    if (others) {
                        others.forEach(
                            (
                                other: { name: string; value: string } | any
                            ): void => {
                                let otherSimilarIndex = rawData.others.findIndex(
                                    (o: {
                                        name: string;
                                        value: string;
                                    }): boolean => {
                                        return o.name === other.name;
                                    }
                                );
                                if (otherSimilarIndex >= 0) {
                                    rawData.others[otherSimilarIndex] = other;
                                }
                            }
                        );
                    }
                    rawData.save(
                        async (
                            error: Error,
                            editedRawData: Document | any
                        ): Promise<void> => {
                            if (error) {
                                new CustomizeException(
                                    Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                    error.message,
                                    Cause.DATABASE
                                );
                            }

                            if (detailUrlId) {
                                editedRawData.detailUrlId = detailUrl;
                            } else {
                                await editedRawData
                                    .populate({
                                        path: 'detailUrlId',
                                        populate: {
                                            path: 'catalogId',
                                            populate: { path: 'hostId' },
                                        },
                                    })
                                    .execPopulate();
                            }

                            resolve(
                                DetailUrlLogic.convertToResponse(editedRawData)
                            );
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
            RawDataModel.findById(id).exec(
                (error: Error, rawData: Document | null): void => {
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
                }
            );
        });
    };

    /**
     * @param rawData
     */

    private static convertToResponse({
        _id,
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
        detailUrl: object;
        title: string;
        price: number;
        acreage: string;
        address: string;
        others: Array<{ name: string; value: string }> | Array<any>;
        createAt: string;
        updateAt: string;
    } {
        let data: {
            id: number;
            detailUrl: object;
            title: string;
            price: number;
            acreage: string;
            address: string;
            others: Array<{ name: string; value: string }> | Array<any>;
            createAt: string;
            updateAt: string;
        } = {
            id: NaN,
            detailUrl: {},
            title: '',
            price: NaN,
            acreage: '',
            address: '',
            others: [],
            createAt: '',
            updateAt: '',
        };

        if (_id) {
            data.id = _id;
        }

        if (detailUrlId && Object.keys(detailUrlId).length > 0) {
            data.detailUrl = DetailUrlLogic.convertToResponse(detailUrlId);
        }

        if (title) {
            data.title = title;
        }

        if (price) {
            data.title = title;
        }

        if (acreage) {
            data.title = acreage;
        }

        if (address) {
            data.title = address;
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
