import { Document } from 'mongoose';
import CatalogModel from './catalog.model';
import HostModel from '../host/host.model';
import CustomizeException from '../exception/customize.exception';
import { Constant } from '../../util/definition/constant';
import { CatalogErrorMessage } from './catalog.error-message';
import { Cause } from '../../util/definition/error/cause';
import async, { Dictionary } from 'async';
import HostLogic from '../host/host.logic';

class CatalogLogic {
    /**
     * @param keyword
     * @param limit
     * @param offset
     * @param hostId
     *
     * @return Promise<{ catalogList: Array<object>; hasNext: boolean }>
     */
    public getAll = (
        keyword: string,
        limit: number,
        offset: number,
        hostId: number
    ): Promise<{ catalogList: Array<object>; hasNext: boolean }> => {
        return new Promise((resolve: any, reject: any): void => {
            CatalogModel.find({
                $or: [
                    { title: { $regex: keyword, $options: 'i' } },
                    { url: { $regex: keyword, $options: 'i' } },
                ],
                hostId: hostId || { $gt: 0 },
            })
                .populate('hostId')
                .skip(offset)
                .limit(limit)
                .exec((error: Error, catalogs: Array<Document>): void => {
                    if (error) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                error.message,
                                Cause.DATABASE
                            )
                        );
                    }

                    let catalogList: Array<object> = [];
                    for (
                        let i: number = 0;
                        i < catalogs.length && i < limit;
                        i++
                    ) {
                        catalogList.push(
                            CatalogLogic.convertToResponse(catalogs[i])
                        );
                    }

                    let hasNext: boolean = catalogList.length < catalogs.length;

                    resolve({ catalogList: catalogList, hasNext: hasNext });
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
            CatalogModel.findById(id)
                .populate('hostId')
                .exec((error, catalog): void => {
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
                                CatalogErrorMessage.CTL_ERR_3,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['id', id]
                            )
                        );
                    }

                    resolve(CatalogLogic.convertToResponse(catalog));
                });
        });
    };

    /**
     * @param body
     *
     * @return Promise<object>
     */
    public create = ({
        title,
        url,
        locator,
        hostId,
    }: {
        title: string;
        url: string;
        locator: { detailUrl: string; pageNumber: string };
        hostId: string;
    }): Promise<object> => {
        return new Promise((resolve: any, reject: any): void => {
            async.parallel(
                {
                    catalog: (callback: any): void => {
                        CatalogModel.findOne({ url: url }).exec(callback);
                    },
                    host: (callback: any): void => {
                        HostModel.findById(hostId).exec(callback);
                    },
                },
                (
                    error: any,
                    {
                        catalog,
                        host,
                    }: Dictionary<
                        | any
                        | { catalog: Document | null; host: Document | null }
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

                    if (catalog) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                CatalogErrorMessage.CTL_ERR_2,
                                Cause.DATA_VALUE.EXISTS,
                                ['url', url]
                            )
                        );
                    }

                    if (!host) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                CatalogErrorMessage.CTL_ERR_3,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['hostId', hostId]
                            )
                        );
                    }

                    new CatalogModel({
                        title: title,
                        url: url,
                        locator: locator,
                        hostId: hostId,
                    }).save(
                        (
                            error: Error,
                            createdCatalog: any | Document
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

                            createdCatalog.hostId = host;
                            resolve(
                                CatalogLogic.convertToResponse(createdCatalog)
                            );
                        }
                    );
                }
            );
        });
    };

    /**
     * @param id
     * @param body
     *
     * @return Promise<object>
     */
    public update = (
        id: string,
        {
            title,
            url,
            locator,
            hostId,
        }: {
            title: string;
            url: string;
            locator: { detailUrl: string; pageNumber: string };
            hostId: string;
        }
    ): Promise<object> => {
        return new Promise((resolve: any, reject: any): void => {
            async.parallel(
                {
                    catalog: (callback: any): void => {
                        CatalogModel.findById(id).exec(callback);
                    },
                    isCatalogExisted: (callback: any): void => {
                        CatalogModel.countDocuments({
                            url: url,
                            hostId: hostId,
                        }).exec(callback);
                    },
                    host: (callback: any): void => {
                        if (hostId) {
                            HostModel.findById(hostId).exec(callback);
                        } else {
                            callback();
                        }
                    },
                },
                (
                    error: any,
                    {
                        catalog,
                        isCatalogExisted,
                        host,
                    }: Dictionary<
                        | any
                        | {
                              catalog: Document | null;
                              isCatalogExisted: Number;
                              host: Document | null;
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
                                CatalogErrorMessage.CTL_ERR_1,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['id', id]
                            )
                        );
                    }

                    if (isCatalogExisted) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                CatalogErrorMessage.CTL_ERR_2,
                                Cause.DATA_VALUE.EXISTS,
                                ['url', url]
                            )
                        );
                    }

                    if (hostId && !host) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                CatalogErrorMessage.CTL_ERR_3,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['hostId', hostId]
                            )
                        );
                    }

                    catalog.title = title || catalog.title;
                    catalog.url = url || catalog.url;
                    if (locator) {
                        catalog.locator.detailUrl =
                            locator.detailUrl || catalog.locator.detailUrl;
                        catalog.locator.pageNumber =
                            locator.pageNumber || catalog.locator.pageNumber;
                    }
                    catalog.hostId = hostId || catalog.hostId;
                    catalog.save(
                        async (
                            error: Error,
                            editedCatalog: any | Document
                        ): Promise<void> => {
                            if (error) {
                                return reject(
                                    new CustomizeException(
                                        Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                        error.message,
                                        Cause.DATABASE
                                    )
                                );
                            }

                            if (hostId) {
                                editedCatalog.hostId = host;
                            } else {
                                await editedCatalog
                                    .populate('hostId')
                                    .execPopulate();
                            }

                            resolve(
                                CatalogLogic.convertToResponse(editedCatalog)
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
            CatalogModel.findById(id).exec(
                (error: Error, catalog: Document | null): void => {
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
                                CatalogErrorMessage.CTL_ERR_1,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['id', id]
                            )
                        );
                    }

                    CatalogModel.findByIdAndDelete(id, (error: Error): void => {
                        if (error) {
                            return reject(
                                new CustomizeException(
                                    Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                    error.message
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
     * @param catalog
     */
    public static convertToResponse({
        _id,
        title,
        url,
        locator,
        hostId,
        cTime,
        mTime,
    }: any): {
        id: number;
        title: string;
        locator: { detailUrl: string; pageNumber: string };
        host: object;
        createAt: string;
        updateAt: string;
    } {
        let data: {
            id: number;
            title: string;
            url: string;
            locator: { detailUrl: string; pageNumber: string };
            host: { id: number; name: string; domain: string };
            createAt: string;
            updateAt: string;
        } = {
            id: NaN,
            title: '',
            url: '',
            locator: { detailUrl: '', pageNumber: '' },
            host: { id: NaN, name: '', domain: '' },
            createAt: '',
            updateAt: '',
        };

        if (_id) {
            data.id = _id;
        }
        if (title) {
            data.title = title;
        }
        if (url) {
            data.url = url;
        }
        if (locator) {
            data.locator = locator;
        }
        if (hostId && Object.keys(hostId).length > 0) {
            data.host = HostLogic.convertToResponse(hostId);
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

export default CatalogLogic;
