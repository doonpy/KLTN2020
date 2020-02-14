import { Document } from 'mongoose';
import CatalogModel from './catalog.model';
import HostModel from '../host/host.model';
import CustomizeException from '../exception/customize.exception';
import { Constant } from '../../util/definition/constant';
import { CatalogErrorMessage } from './error-message';
import { Cause } from '../../util/definition/error/cause';
import async, { Dictionary } from 'async';
import { HostErrorMessage } from '../host/error-message';

class CatalogLogic {
    /**
     * @return Promise<Array<object>>
     */
    public getAll = (limit: number, offset: number): Promise<Array<object>> => {
        return new Promise((resolve: any, reject: any): void => {
            CatalogModel.find()
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
                    catalogs.forEach((host: Document): void => {
                        catalogList.push(CatalogLogic.convertToResponse(host));
                    });

                    resolve(catalogList);
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
            CatalogModel.findById(id).exec((error, catalog): void => {
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
                            HostErrorMessage.NOT_FOUND,
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
     * @return Promise<Document>
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
    }): Promise<Document> => {
        return new Promise((resolve: any, reject: any): void => {
            async.parallel(
                {
                    catalog: (callback: any): void => {
                        CatalogModel.findOne({ url: url }).exec(callback);
                    },
                    isHostExisted: (callback: any): void => {
                        HostModel.countDocuments({ _id: hostId }).exec(
                            callback
                        );
                    },
                },
                (
                    error: any,
                    {
                        catalog,
                        isHostExisted,
                    }: Dictionary<
                        any | { catalog: Document; isHostExisted: Number }
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
                                CatalogErrorMessage.EXISTS,
                                Cause.DATA_VALUE.EXISTS,
                                ['url', url]
                            )
                        );
                    }

                    if (!isHostExisted) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                HostErrorMessage.NOT_FOUND,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['id', hostId]
                            )
                        );
                    }

                    new CatalogModel({
                        title: title,
                        url: url,
                        locator: locator,
                        hostId: hostId,
                    }).save((error: Error, createdCatalog: Document): void => {
                        if (error) {
                            return reject(
                                new CustomizeException(
                                    Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                    error.message,
                                    Cause.DATABASE
                                )
                            );
                        }

                        resolve(CatalogLogic.convertToResponse(createdCatalog));
                    });
                }
            );
        });
    };

    /**
     * @param id
     * @param body
     *
     * @return Promise<Document>
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
            locator: object;
            hostId: string;
        }
    ): Promise<Document> => {
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
                    isHostExisted: (callback: any): void => {
                        HostModel.countDocuments({ _id: hostId }).exec(
                            callback
                        );
                    },
                },
                (
                    error: any,
                    {
                        catalog,
                        isCatalogExisted,
                        isHostExisted,
                    }: Dictionary<
                        | any
                        | {
                              catalog: Document;
                              isCatalogExisted: Number;
                              isHostExisted: Number;
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
                                CatalogErrorMessage.NOT_FOUND,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['id', id]
                            )
                        );
                    }

                    if (isCatalogExisted) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                CatalogErrorMessage.EXISTS,
                                Cause.DATA_VALUE.EXISTS,
                                ['url', url]
                            )
                        );
                    }

                    if (!isHostExisted) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                HostErrorMessage.NOT_FOUND,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['id', hostId]
                            )
                        );
                    }

                    catalog.title = title || catalog.title;
                    catalog.url = url || catalog.url;
                    catalog.locator = locator || catalog.locator;
                    catalog.hostId = hostId || catalog.hostId;
                    catalog.save(
                        (error: Error, editedCatalog: Document): void => {
                            if (error) {
                                return reject(
                                    new CustomizeException(
                                        Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                        error.message,
                                        Cause.DATABASE
                                    )
                                );
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
                                CatalogErrorMessage.NOT_FOUND,
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
    private static convertToResponse({
        _id,
        title,
        url,
        locator,
        hostId,
        cTime,
        mTime,
    }: any): {
        id: string;
        title: string;
        locator: { detailUrl: string; pageNumber: string };
        hostId: string;
        createAt: string;
        updateAt: string;
    } {
        let data: {
            id: string;
            title: string;
            url: string;
            locator: { detailUrl: string; pageNumber: string };
            hostId: string;
            createAt: string;
            updateAt: string;
        } = {
            id: '',
            title: '',
            url: '',
            locator: { detailUrl: '', pageNumber: '' },
            hostId: '',
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
        if (hostId) {
            data.hostId = hostId;
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
