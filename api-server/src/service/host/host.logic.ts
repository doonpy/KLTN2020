import { DocumentQuery, Query } from 'mongoose';
import HostModel from './host.model';
import { HostApiModel, HostDocumentModel, HostLogicInterface } from './host.interface';
import CommonLogicBase from '../../common/service/common.service.logic.base';
import CommonServiceWording from '../../common/service/common.service.wording';
import ResponseStatusCode from '../../common/common.response-status.code';
import HostWording from './host.wording';

export default class HostLogic extends CommonLogicBase implements HostLogicInterface {
    public static instance: HostLogic;

    /**
     * @return {HostLogic}
     */
    public static getInstance(): HostLogic {
        if (!this.instance) {
            this.instance = new HostLogic();
        }

        return this.instance;
    }

    /**
     * @param {number | undefined} limit
     * @param {number | undefined} offset
     * @param {object | undefined} conditions
     * @param {boolean | undefined} isPopulate
     *
     * @return Promise<{ documents: HostDocumentModel[]; hasNext: boolean }>
     */
    public async getAll(
        limit?: number,
        offset?: number,
        conditions?: object,
        isPopulate?: boolean
    ): Promise<{ documents: HostDocumentModel[]; hasNext: boolean }> {
        const documentQuery: DocumentQuery<HostDocumentModel[], HostDocumentModel, {}> = HostModel.find(
            conditions || {}
        );
        const remainQuery: Query<number> = HostModel.countDocuments(conditions || {});

        if (offset) {
            documentQuery.skip(offset);
            remainQuery.skip(offset);
        }
        if (limit) {
            documentQuery.limit(limit);
        }

        const hosts: HostDocumentModel[] = await documentQuery.exec();
        const remainHost: number = await remainQuery.exec();

        return { documents: hosts, hasNext: hosts.length < remainHost };
    }

    /**
     * @param {number} id
     *
     * @return Promise<object>
     */
    public async getById(id: number): Promise<HostDocumentModel> {
        return (await HostModel.findById(id).exec()) as HostDocumentModel;
    }

    /**
     * @param {string} domain
     *
     * @return Promise<HostDocumentModel | null>
     */
    public async getByDomain(domain: string): Promise<HostDocumentModel> {
        return (await HostModel.findOne({ domain }).exec()) as HostDocumentModel;
    }

    /**
     * @param {HostDocumentModel} body
     *
     * @return Promise<object>
     */
    public async create({ name, domain }: HostDocumentModel): Promise<HostDocumentModel> {
        return await new HostModel({
            name,
            domain,
        }).save();
    }

    /**
     * @param id
     * @param body
     *
     * @return Promise<object>
     */
    public async update(id: number, { name, domain }: HostDocumentModel): Promise<HostDocumentModel> {
        const host: HostDocumentModel = await this.getById(id);

        host.name = name || host.name;
        host.domain = domain || host.domain;

        return await host.save();
    }

    /**
     * @param id
     *
     * @return Promise<void>
     */
    public async delete(id: number): Promise<void> {
        await HostModel.findByIdAndDelete(id).exec();
    }

    /**
     * @param {string} domain
     *
     * @return {boolean}
     */
    public async isExistsWithDomain(domain: string): Promise<boolean> {
        const result: number = await HostModel.countDocuments({ domain }).exec();

        return result !== 0;
    }

    /**
     * @param {number} id
     *
     * @return {boolean}
     */
    public async isExistsWithId(id: number | HostDocumentModel): Promise<boolean> {
        if (typeof id === 'object') {
            id = id._id;
        }
        const result: number = await HostModel.countDocuments({ _id: id }).exec();

        return result !== 0;
    }

    /**
     * @param {string} domain
     * @param {boolean | undefined} isNot // if isNot = true => check NOT exists
     *
     * @return {Promise<void>}
     */
    public async checkExistsWithDomain(domain: string, isNot?: boolean): Promise<void> {
        const isExists: boolean = await this.isExistsWithDomain(domain);

        if (isNot) {
            if (isExists) {
                throw {
                    statusCode: ResponseStatusCode.BAD_REQUEST,
                    cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_2, value: [HostWording.HOST_2] },
                    message: {
                        wording: CommonServiceWording.MESSAGE.MSG_CM_SER_2,
                        value: [HostWording.HOST_2, HostWording.HOST_3, domain],
                    },
                };
            }
        } else if (!isExists) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_1, value: [HostWording.HOST_2] },
                message: {
                    wording: CommonServiceWording.MESSAGE.MSG_CM_SER_1,
                    value: [HostWording.HOST_2, HostWording.HOST_3, domain],
                },
            };
        }
    }

    /**
     * @param {number | HostDocumentModel} id
     * @param {boolean | undefined} isNot // if isNot = true => check NOT exists
     *
     * @return {Promise<void>}
     */
    public async checkExistsWithId(id: number | HostDocumentModel, isNot?: boolean): Promise<void> {
        const isExists: boolean = await this.isExistsWithId(id);

        if (isNot) {
            if (isExists) {
                throw {
                    statusCode: ResponseStatusCode.BAD_REQUEST,
                    cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_2, value: [HostWording.HOST_2] },
                    message: {
                        wording: CommonServiceWording.MESSAGE.MSG_CM_SER_2,
                        value: [HostWording.HOST_2, HostWording.HOST_1, id],
                    },
                };
            }
        } else if (!isExists) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CommonServiceWording.CAUSE.CAU_CM_SER_1, value: [HostWording.HOST_2] },
                message: {
                    wording: CommonServiceWording.MESSAGE.MSG_CM_SER_1,
                    value: [HostWording.HOST_2, HostWording.HOST_1, id],
                },
            };
        }
    }

    /**
     * @param {HostDocumentModel}
     * @param {number} languageIndex
     *
     * @return {HostApiModel}
     */
    public convertToApiResponse(
        { _id, name, domain, cTime, mTime }: HostDocumentModel,
        languageIndex = 0
    ): HostApiModel {
        const data: HostApiModel = {
            id: null,
            name: null,
            domain: null,
            createAt: null,
            updateAt: null,
        };

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
