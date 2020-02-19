import HostModel from './host.model';
import { Document } from 'mongoose';
import { Constant } from '../../util/definition/constant';
import { HostErrorMessage } from './host.error-message';
import async, { Dictionary } from 'async';
import CustomizeException from '../exception/customize.exception';
import { Cause } from '../../util/definition/error/cause';

class HostLogic {
    /**
     * @param keyword
     * @param limit
     * @param offset
     *
     * @return Promise<{ hostList: Array<object>, hasNext: boolean }>
     */
    public getAll = (
        keyword: string,
        limit: number,
        offset: number
    ): Promise<{ hostList: Array<object>; hasNext: boolean }> => {
        return new Promise((resolve: any, reject: any): void => {
            HostModel.find({
                $or: [{ name: { $regex: keyword, $options: 'i' } }, { domain: { $regex: keyword, $options: 'i' } }],
            })
                .skip(offset)
                .exec((error: Error, hosts: Array<Document>): void => {
                    if (error) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                error.message,
                                Cause.DATABASE
                            )
                        );
                    }

                    let hostList: Array<object> = [];
                    for (let i: number = 0; i < hosts.length && i < limit; i++) {
                        hostList.push(HostLogic.convertToResponse(hosts[i]));
                    }

                    let hasNext: boolean = hostList.length < hosts.length;

                    resolve({ hostList: hostList, hasNext: hasNext });
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
            HostModel.findById(id).exec((error: Error, host: Document): void => {
                if (error) {
                    return reject(
                        new CustomizeException(
                            Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                            error.message,
                            Cause.DATABASE
                        )
                    );
                }

                if (!host) {
                    return reject(
                        new CustomizeException(
                            Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                            HostErrorMessage.HOST_ERR_1,
                            Cause.DATA_VALUE.NOT_FOUND,
                            ['id', id]
                        )
                    );
                }

                resolve(HostLogic.convertToResponse(host));
            });
        });
    };

    /**
     * @param body
     *
     * @return Promise<object>
     */
    public create = ({ name, domain }: { name: string; domain: string }): Promise<object> => {
        return new Promise((resolve: any, reject: any): void => {
            HostModel.findOne({ domain: domain }).exec((error: Error, host: Document | null): void => {
                if (error) {
                    return reject(
                        new CustomizeException(
                            Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                            error.message,
                            Cause.DATABASE
                        )
                    );
                }

                if (host) {
                    return reject(
                        new CustomizeException(
                            Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                            HostErrorMessage.HOST_ERR_2,
                            Cause.DATA_VALUE.EXISTS,
                            ['domain', domain]
                        )
                    );
                }

                new HostModel({
                    name: name,
                    domain: domain,
                }).save((error: Error, createdHost: Document): void => {
                    if (error) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                error.message,
                                Cause.DATABASE
                            )
                        );
                    }

                    resolve(HostLogic.convertToResponse(createdHost));
                });
            });
        });
    };

    /**
     * @param id
     * @param body
     *
     * @return Promise<object>
     */
    public update = (id: string, { name, domain }: { name: string; domain: string }): Promise<object> => {
        return new Promise((resolve: any, reject: any): void => {
            async.parallel(
                {
                    host: (callback: any): void => {
                        HostModel.findById(id).exec(callback);
                    },
                    isExisted: (callback: any): void => {
                        HostModel.countDocuments({ domain: domain }).exec(callback);
                    },
                },
                (error: any, { host, isExisted }: Dictionary<any | { host: Document; isExisted: Number }>): void => {
                    if (error) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                error.message,
                                Cause.DATABASE
                            )
                        );
                    }

                    if (!host) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                HostErrorMessage.HOST_ERR_1,
                                Cause.DATA_VALUE.NOT_FOUND,
                                ['id', id]
                            )
                        );
                    }

                    if (isExisted) {
                        return reject(
                            new CustomizeException(
                                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                                HostErrorMessage.HOST_ERR_2,
                                Cause.DATA_VALUE.EXISTS,
                                ['domain', domain]
                            )
                        );
                    }

                    host.name = name || host.name;
                    host.domain = domain || host.domain;
                    host.save((error: Error, editedHost: Document): void => {
                        if (error) {
                            return reject(
                                new CustomizeException(
                                    Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                                    error.message,
                                    Cause.DATABASE
                                )
                            );
                        }

                        resolve(HostLogic.convertToResponse(editedHost));
                    });
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
            HostModel.findById(id).exec((error: Error, host: Document | null): void => {
                if (error) {
                    return reject(
                        new CustomizeException(
                            Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                            error.message,
                            Cause.DATABASE
                        )
                    );
                }

                if (!host) {
                    return reject(
                        new CustomizeException(
                            Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                            HostErrorMessage.HOST_ERR_1,
                            Cause.DATA_VALUE.NOT_FOUND,
                            ['id', id]
                        )
                    );
                }

                HostModel.findByIdAndDelete(id, (error: Error): void => {
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
     * @param host
     */
    public static convertToResponse({
        _id,
        name,
        domain,
        cTime,
        mTime,
    }: any): {
        id: number;
        name: string;
        domain: string;
        createAt: string;
        updateAt: string;
    } {
        let data: {
            id: number;
            name: string;
            domain: string;
            createAt: string;
            updateAt: string;
        } = { id: NaN, name: '', domain: '', createAt: '', updateAt: '' };

        if (_id) {
            data.id = _id;
        }
        if (name) {
            data.name = name;
        }
        if (domain) {
            data.domain = domain;
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

export default HostLogic;
