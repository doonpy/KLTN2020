import PatternModel from './pattern.model';
import CatalogModel from '../catalog/catalog.model';
import DetailUrlModel from '../detail-url/detail-url.model';
import { Document } from 'mongoose';
import CustomizeException from '../exception/customize.exception';
import { Constant } from '../../util/definition/constant';
import { Cause } from '../../util/definition/error/cause';
import async, { Dictionary } from 'async';
import { PatternErrorMessage } from './pattern.error-message';
import DetailUrlLogic from '../detail-url/detail-url.logic';
import CatalogLogic from '../catalog/catalog.logic';

class PatternLogic {
    /**
     * @param limit
     * @param offset
     * @param catalogId
     *
     * @return Promise<{ patternList: Array<object>; hasNext: boolean }>
     */
    public getAll = (
        limit: number,
        offset: number,
        catalogId: number
    ): Promise<{ patternList: Array<object>; hasNext: boolean }> => {
        return new Promise((resolve: any, reject: any): void => {
            PatternModel.find({ catalogId: catalogId || { $gt: 0 } })
                .populate({ path: 'catalogId', populate: { path: 'hostId' } })
                .populate({
                    path: 'sourceUrlId',
                    populate: {
                        path: 'catalogId',
                        populate: { path: 'hostId' },
                    },
                })
                .skip(offset)
                .exec((error: Error, patterns: Array<Document>): void => {
                    if (error) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                error.message,
                                Cause.DATABASE
                            )
                        );
                    }

                    let patternList: Array<object> = [];
                    for (let i: number = 0; i < patterns.length && i < limit; i++) {
                        patternList.push(PatternLogic.convertToResponse(patterns[i]));
                    }

                    let hasNext: boolean = patternList.length < patterns.length;

                    resolve({ patternList: patternList, hasNext: hasNext });
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
            PatternModel.findById(id)
                .populate({ path: 'catalogId', populate: { path: 'hostId' } })
                .populate({
                    path: 'sourceUrlId',
                    populate: {
                        path: 'catalogId',
                        populate: { path: 'hostId' },
                    },
                })
                .exec((error: Error, pattern: Document | null): void => {
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
                                PatternErrorMessage.PTN_ERROR_1,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['id', id]
                            )
                        );
                    }

                    resolve(PatternLogic.convertToResponse(pattern));
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
        sourceUrlId,
        mainLocator,
        subLocator,
    }: {
        catalogId: number;
        sourceUrlId: number;
        mainLocator: {
            title: string;
            price: string;
            acreage: string;
            address: string;
        };
        subLocator: Array<{ name: string; locator: string }>;
    }): Promise<object> => {
        return new Promise((resolve: any, reject: any): void => {
            async.parallel(
                {
                    isPatternExisted: (callback: any): void => {
                        PatternModel.countDocuments({
                            catalogId: catalogId,
                        }).exec(callback);
                    },
                    catalog: (callback: any): void => {
                        CatalogModel.findById(catalogId)
                            .populate('hostId')
                            .exec(callback);
                    },
                    sourceUrl: (callback: any): void => {
                        DetailUrlModel.findById(sourceUrlId)
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
                        isPatternExisted,
                        catalog,
                        sourceUrl,
                    }: Dictionary<
                        | any
                        | {
                              isPatternExisted: number;
                              catalog: Document;
                              sourceUrl: Document;
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
                                PatternErrorMessage.PTN_ERROR_3,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['catalogId', catalogId]
                            )
                        );
                    }

                    if (!sourceUrl) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                PatternErrorMessage.PTN_ERROR_4,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['sourceUrlId', sourceUrlId]
                            )
                        );
                    }

                    if (isPatternExisted) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                PatternErrorMessage.PTN_ERROR_2,
                                Cause.DATA_VALUE.EXISTS,
                                ['catalogId', catalogId]
                            )
                        );
                    }

                    new PatternModel({
                        catalogId: catalogId,
                        sourceUrlId: sourceUrlId,
                        mainLocator: mainLocator,
                        subLocator: subLocator,
                    }).save((error: Error, createdPattern: Document | any): void => {
                        if (error) {
                            return reject(
                                new CustomizeException(
                                    Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                    error.message,
                                    Cause.DATABASE
                                )
                            );
                        }

                        createdPattern.catalogId = catalog;
                        createdPattern.sourceUrlId = sourceUrl;
                        resolve(PatternLogic.convertToResponse(createdPattern));
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
            sourceUrlId,
            mainLocator,
            subLocator,
        }: {
            catalogId: string;
            sourceUrlId: number;
            mainLocator: {
                title: string;
                price: string;
                acreage: string;
                address: string;
            };
            subLocator: Array<{ name: string; locator: string }>;
        }
    ): Promise<object> => {
        return new Promise((resolve: any, reject: any): void => {
            async.parallel(
                {
                    pattern: (callback: any): void => {
                        PatternModel.findById(id).exec(callback);
                    },
                    isPatternExisted: (callback: any): void => {
                        PatternModel.countDocuments({
                            catalogId: catalogId,
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
                    sourceUrl: (callback: any): void => {
                        if (sourceUrlId) {
                            DetailUrlModel.findById(sourceUrlId)
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
                        pattern,
                        isPatternExisted,
                        catalog,
                        sourceUrl,
                    }: Dictionary<
                        | any
                        | {
                              pattern: Document | null;
                              isPatternExisted: number;
                              catalog: Document | null;
                              sourceUrl: Document | null;
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

                    if (!pattern) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                PatternErrorMessage.PTN_ERROR_1,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['id', id]
                            )
                        );
                    }

                    if (!catalog && catalogId) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                PatternErrorMessage.PTN_ERROR_3,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['catalogId', catalogId]
                            )
                        );
                    }

                    if (!sourceUrl && sourceUrlId) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                PatternErrorMessage.PTN_ERROR_4,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['sourceUrlId', sourceUrlId]
                            )
                        );
                    }

                    if (isPatternExisted && catalogId !== catalog.catalogId) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                PatternErrorMessage.PTN_ERROR_2,
                                Cause.DATA_VALUE.EXISTS,
                                ['catalogId', catalogId]
                            )
                        );
                    }

                    pattern.catalogId = catalogId || pattern.catalogId;
                    pattern.sourceUrlId = sourceUrlId || pattern.sourceUrlId;
                    if (mainLocator) {
                        pattern.mainLocator.title = mainLocator.title || pattern.mainLocator.title;
                        pattern.mainLocator.price = mainLocator.price || pattern.mainLocator.price;
                        pattern.mainLocator.acreage = mainLocator.acreage || pattern.mainLocator.acreage;
                        pattern.mainLocator.address = mainLocator.address || pattern.mainLocator.address;
                    }
                    if (subLocator) {
                        subLocator.forEach((subLocatorItem: { name: string; locator: string }): void => {
                            let subLocatorSimilarIndex = pattern.subLocator.findIndex(
                                (s: { name: string; locator: string }): boolean => {
                                    return s.name === subLocatorItem.name;
                                }
                            );
                            if (subLocatorSimilarIndex >= 0) {
                                pattern.subLocator[subLocatorSimilarIndex] = subLocatorItem;
                            }
                        });
                    }
                    pattern.save(
                        async (error: Error, editedPattern: Document | any): Promise<void> => {
                            if (error) {
                                new CustomizeException(
                                    Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                    error.message,
                                    Cause.DATABASE
                                );
                            }

                            if (catalogId) {
                                editedPattern.catalogId = catalog;
                            } else {
                                await editedPattern
                                    .populate({
                                        path: 'catalogId',
                                        populate: { path: 'hostId' },
                                    })
                                    .execPopulate();
                            }

                            if (sourceUrlId) {
                                editedPattern.sourceUrlId = sourceUrl;
                            } else {
                                await editedPattern
                                    .populate({
                                        path: 'sourceUrlId',
                                        populate: {
                                            path: 'catalogId',
                                            populate: { path: 'hostId' },
                                        },
                                    })
                                    .execPopulate();
                            }

                            resolve(PatternLogic.convertToResponse(editedPattern));
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
            PatternModel.findById(id).exec((error: Error, pattern: Document | null): void => {
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
                            PatternErrorMessage.PTN_ERROR_1,
                            Cause.DATA_VALUE.NOT_FOUND,
                            ['id', id]
                        )
                    );
                }

                PatternModel.findByIdAndDelete(id, (error: Error): void => {
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

    private static convertToResponse({
        _id,
        catalogId,
        sourceUrlId,
        mainLocator,
        subLocator,
        cTime,
        mTime,
    }: any): {
        id: number;
        catalog: object;
        sourceUrl: object;
        mainLocator: {
            title: string;
            price: string;
            acreage: string;
            address: string;
        };
        subLocator: { name: string; locator: string };
        createAt: string;
        updateAt: string;
    } {
        let data: {
            id: number;
            catalog: object;
            sourceUrl: object;
            mainLocator: {
                title: string;
                price: string;
                acreage: string;
                address: string;
            };
            subLocator: { name: string; locator: string };
            createAt: string;
            updateAt: string;
        } = {
            id: NaN,
            catalog: {},
            sourceUrl: {},
            mainLocator: { title: '', price: '', acreage: '', address: '' },
            subLocator: { name: '', locator: '' },
            createAt: '',
            updateAt: '',
        };

        if (_id) {
            data.id = _id;
        }
        if (catalogId && Object.keys(catalogId).length > 0) {
            data.catalog = CatalogLogic.convertToResponse(catalogId);
        }
        if (sourceUrlId && Object.keys(sourceUrlId).length > 0) {
            data.sourceUrl = DetailUrlLogic.convertToResponse(sourceUrlId);
        }

        if (Object.keys(mainLocator).length > 0) {
            data.mainLocator = mainLocator;
        }

        if (Object.keys(subLocator).length > 0) {
            data.subLocator = subLocator;
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

export default PatternLogic;
