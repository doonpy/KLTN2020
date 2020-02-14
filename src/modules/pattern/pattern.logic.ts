import PatternModel from './pattern.model';
import { Document } from 'mongoose';
import CustomizeException from '../exception/customize.exception';
import { Constant } from '../../util/definition/constant';
import { Cause } from '../../util/definition/error/cause';
import async from 'async';
import { PatternErrorMessage } from './error-message';

class PatternLogic {
    /**
     * @return Promise<Array<object>>
     */
    public getAll = (limit: number, offset: number): Promise<Array<object>> => {
        return new Promise((resolve: any, reject: any): void => {
            PatternModel.find()
                .skip(offset)
                .limit(limit)
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
                    patterns.forEach((pattern: Document): void => {
                        patternList.push(
                            PatternLogic.convertToResponse(pattern)
                        );
                    });

                    resolve(patternList);
                });
        });
    };

    /**
     * Get pattern by ID
     *
     * @param id
     *
     * @return Promise<Document[] | Error | null>
     */
    public getById = (id: string): Promise<Document | Error | null> => {
        return new Promise((resolve, reject) => {
            PatternModel.findById(id, (error, pattern) => {
                if (error) {
                    reject(error);
                }

                resolve(pattern);
            });
        });
    };

    /**
     * @param requestBody
     *
     * @return Promise<Document>
     */
    public create = ({
        catalogId,
        sourceUrl,
        mainLocator,
        subLocator,
    }: {
        catalogId: string;
        sourceUrl: string;
        mainLocator: {
            title: string;
            price: string;
            acreage: string;
            address: string;
        };
        subLocator: Array<{ name: string; locator: string }>;
    }): Promise<Document> => {
        return new Promise((resolve: any, reject: any): void => {
            PatternModel.countDocuments({ catalogId: catalogId }).exec(
                (error: Error, isCatalogExisted: number): void => {
                    if (error) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                error.message,
                                Cause.DATABASE
                            )
                        );
                    }

                    if (isCatalogExisted) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                PatternErrorMessage.EXISTS,
                                Cause.DATA_VALUE.EXISTS,
                                ['catalog id', catalogId]
                            )
                        );
                    }

                    new PatternModel({
                        catalogId: catalogId,
                        sourceUrl: sourceUrl,
                        mainLocator: mainLocator,
                        subLocator: subLocator,
                    }).save((error: Error, createdPattern: Document): void => {
                        if (error) {
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                error.message,
                                Cause.DATABASE
                            );
                        }

                        resolve(PatternLogic.convertToResponse(createdPattern));
                    });
                }
            );
        });
    };

    /**
     * Update catalog with ID
     *
     * @param catalogId
     * @param title
     * @param url
     * @param detailUrlLocator
     * @param pageNumberLocator
     * @param hostId
     *
     * @return Promise<Error | null>
     */
    public update = (
        catalogId: string,
        title: string,
        url: string,
        detailUrlLocator: string,
        pageNumberLocator: string,
        hostId: string
    ): Promise<Error | null> => {
        return new Promise((resolve, reject) => {
            let updateObject = {
                title: title,
                url: url,
                locator: {
                    detailUrl: detailUrlLocator,
                    pageNumber: pageNumberLocator,
                },
                hostId: hostId,
            };
            PatternModel.findByIdAndUpdate(catalogId, updateObject, error => {
                if (error) {
                    reject(error);
                }

                resolve();
            });
        });
    };

    /**
     * Delete catalog by with ID
     *
     * @param catalogId
     *
     * @return Promise<Error | null>
     */
    public delete = (catalogId: string): Promise<Error | null> => {
        return new Promise((resolve, reject) => {
            PatternModel.findByIdAndDelete(catalogId, error => {
                if (error) {
                    reject(error);
                }

                resolve();
            });
        });
    };

    /**
     * @param pattern
     */
    private static convertToResponse({
        _id,
        catalogId,
        sourceUrl,
        mainLocator,
        subLocator,
        cTime,
        mTime,
    }: any): {
        id: number;
        catalogId: number;
        sourceUrl: string;
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
            catalogId: number;
            sourceUrl: string;
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
            catalogId: NaN,
            sourceUrl: '',
            mainLocator: { title: '', price: '', acreage: '', address: '' },
            subLocator: { name: '', locator: '' },
            createAt: '',
            updateAt: '',
        };

        if (_id) {
            data.id = _id;
        }
        if (catalogId) {
            data.catalogId = catalogId;
        }
        if (sourceUrl) {
            data.sourceUrl = sourceUrl;
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
