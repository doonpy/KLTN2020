import DetailUrlModel from './detail-url.model';
import { Document } from 'mongoose';
import CustomizeException from '../exception/customize.exception';
import { Constant } from '../../util/definition/constant';
import { Cause } from '../../util/definition/error/cause';
import { DetailUrlErrorMessage } from './detail.error-message';
import async, { Dictionary } from 'async';
import CatalogModel from '../catalog/catalog.model';
import CatalogLogic from '../catalog/catalog.logic';

class DetailUrlLogic {
    /**
     * @param limit
     * @param offset
     * @param catalogId
     *
     * @return Promise<Array<{ detailUrlList: Array<object>; hasNext: boolean }>>
     */
    public getAll = (
        limit: number,
        offset: number,
        catalogId: number
    ): Promise<{ detailUrlList: Array<object>; hasNext: boolean }> => {
        return new Promise((resolve: any, reject: any): void => {
            DetailUrlModel.find({
                catalogId: catalogId || { $gt: 0 },
            })
                .populate({ path: 'catalogId', populate: { path: 'hostId' } })
                .skip(offset)
                .exec((error: Error, detailUrls: Array<Document>): void => {
                    if (error) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                error.message,
                                Cause.DATABASE
                            )
                        );
                    }

                    let detailUrlList: Array<object> = [];
                    for (let i: number = 0; i < detailUrls.length && i < limit; i++) {
                        detailUrlList.push(DetailUrlLogic.convertToResponse(detailUrls[i]));
                    }

                    let hasNext: boolean = detailUrlList.length < detailUrls.length;

                    resolve({ detailUrlList: detailUrlList, hasNext: hasNext });
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
            DetailUrlModel.findById(id)
                .populate({ path: 'catalogId', populate: { path: 'hostId' } })
                .exec((error: Error, detailUrl: Document | null): void => {
                    if (error) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                error.message,
                                Cause.DATABASE
                            )
                        );
                    }

                    if (!detailUrl) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                DetailUrlErrorMessage.DU_ERROR_1,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['id', id]
                            )
                        );
                    }

                    resolve(DetailUrlLogic.convertToResponse(detailUrl));
                });
        });
    };

    /**
     * @param requestBody
     *
     * @return Promise<object>
     */
    public create = ({
        catalogId,
        url,
        isExtracted,
        requestRetries,
    }: {
        catalogId: string;
        url: string;
        isExtracted: boolean;
        requestRetries: number;
    }): Promise<object> => {
        return new Promise((resolve: any, reject: any): void => {
            async.parallel(
                {
                    isDetailUrlExisted: (callback: any): void => {
                        DetailUrlModel.countDocuments({
                            url: url,
                        }).exec(callback);
                    },
                    catalog: (callback: any): void => {
                        CatalogModel.findById(catalogId)
                            .populate('hostId')
                            .exec(callback);
                    },
                },
                (
                    error: Error | undefined,
                    {
                        isDetailUrlExisted,
                        catalog,
                    }: Dictionary<
                        | any
                        | {
                              isDetailUrlExisted: number;
                              catalog: Document | null;
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

                    if (!catalog) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                DetailUrlErrorMessage.DU_ERROR_3,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['catalogId', catalogId]
                            )
                        );
                    }

                    if (isDetailUrlExisted) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                DetailUrlErrorMessage.DU_ERROR_2,
                                Cause.DATA_VALUE.EXISTS,
                                ['url', url]
                            )
                        );
                    }

                    new DetailUrlModel({
                        catalogId: catalogId,
                        url: url,
                    }).save((error: Error, createdDetailUrl: Document | any): void => {
                        if (error) {
                            return reject(
                                new CustomizeException(
                                    Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                    error.message,
                                    Cause.DATABASE
                                )
                            );
                        }

                        createdDetailUrl.catalogId = catalog;
                        resolve(DetailUrlLogic.convertToResponse(createdDetailUrl));
                    });
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
            catalogId,
            url,
            isExtracted,
            requestRetries,
        }: {
            catalogId: string;
            url: string;
            isExtracted: boolean;
            requestRetries: number;
        }
    ): Promise<object> => {
        return new Promise((resolve: any, reject: any): void => {
            async.parallel(
                {
                    detailUrl: (callback: any): void => {
                        DetailUrlModel.findById(id).exec(callback);
                    },
                    isDetailUrlExisted: (callback: any): void => {
                        DetailUrlModel.countDocuments({
                            url: url,
                        }).exec(callback);
                    },
                    catalog: (callback: any): void => {
                        if (catalogId) {
                            CatalogModel.findById(catalogId)
                                .populate('hostId')
                                .exec(callback);
                        } else {
                            callback();
                        }
                    },
                },
                (
                    error: Error | undefined,
                    {
                        detailUrl,
                        isDetailUrlExisted,
                        catalog,
                    }: Dictionary<
                        | any
                        | {
                              detailUrl: Document | null;
                              isPatternExisted: number;
                              catalog: Document | null;
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

                    if (!detailUrl) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                DetailUrlErrorMessage.DU_ERROR_1,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['id', id]
                            )
                        );
                    }

                    if (!catalog && catalogId) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                DetailUrlErrorMessage.DU_ERROR_3,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['catalogId', catalogId]
                            )
                        );
                    }

                    if (isDetailUrlExisted && url !== detailUrl.url) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                DetailUrlErrorMessage.DU_ERROR_2,
                                Cause.DATA_VALUE.EXISTS,
                                ['url', url]
                            )
                        );
                    }

                    detailUrl.catalogId = catalogId || detailUrl.catalogId;
                    detailUrl.url = url || detailUrl.url;
                    detailUrl.isExtracted = isExtracted !== detailUrl.isExtracted ? isExtracted : detailUrl.isExtracted;
                    detailUrl.requestRetries =
                        requestRetries !== detailUrl.requestRetries ? requestRetries : detailUrl.requestRetries;
                    detailUrl.save(
                        async (error: Error, editedDetailUrl: Document | any): Promise<void> => {
                            if (error) {
                                new CustomizeException(
                                    Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                    error.message,
                                    Cause.DATABASE
                                );
                            }

                            if (catalogId) {
                                editedDetailUrl.catalogId = catalog;
                            } else {
                                await editedDetailUrl
                                    .populate({
                                        path: 'catalogId',
                                        populate: { path: 'hostId' },
                                    })
                                    .execPopulate();
                            }
                            resolve(DetailUrlLogic.convertToResponse(editedDetailUrl));
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
            DetailUrlModel.findById(id).exec((error: Error, pattern: Document | null): void => {
                if (error) {
                    return reject(
                        new CustomizeException(
                            Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                            error.message,
                            Cause.DATABASE
                        )
                    );
                }

                if (!pattern) {
                    return reject(
                        new CustomizeException(
                            Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                            DetailUrlErrorMessage.DU_ERROR_1,
                            Cause.DATA_VALUE.NOT_FOUND,
                            ['id', id]
                        )
                    );
                }

                DetailUrlModel.findByIdAndDelete(id, (error: Error): void => {
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
     * @param pattern
     */

    public static convertToResponse({
        _id,
        catalogId,
        url,
        isExtracted,
        requestRetries,
        cTime,
        mTime,
    }: any): {
        id: number;
        catalog: object;
        url: string;
        isExtracted: boolean;
        requestRetries: number;
        createAt: string;
        updateAt: string;
    } {
        let data: {
            id: number;
            catalog: object;
            url: string;
            isExtracted: boolean;
            requestRetries: number;
            createAt: string;
            updateAt: string;
        } = {
            id: NaN,
            catalog: {},
            url: '',
            isExtracted: false,
            requestRetries: 0,
            createAt: '',
            updateAt: '',
        };

        if (_id) {
            data.id = _id;
        }
        if (catalogId && Object.keys(catalogId).length > 0) {
            data.catalog = CatalogLogic.convertToResponse(catalogId);
        }
        if (url) {
            data.url = url;
        }

        if (isExtracted) {
            data.isExtracted = isExtracted;
        }

        if (requestRetries) {
            data.requestRetries = requestRetries;
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

export default DetailUrlLogic;
