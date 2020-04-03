/// <reference path="./host.error-response.ts" />

import HostModel from './host.model';
import { Exception } from '../exception/exception.index';
import HostModelInterface from './host.model.interface';
import { DocumentQuery, Query } from 'mongoose';
import LogicBase from '../logic.base';
import { Database } from '../database/database.index';
import { HostErrorResponseMessage, HostErrorResponseRootCause } from './host.error-response';
import { Common } from '../../common/common.index';
import HostApiInterface from './host.api.interface';

export default class HostLogic extends LogicBase {
    /**
     * @param keyword
     * @param limit
     * @param offset
     *
     * @return Promise<{ hosts: Array<HostModelInterface>, hasNext: boolean }>
     */
    public async getAll(
        keyword: string,
        limit: number,
        offset: number
    ): Promise<{ hosts: Array<HostModelInterface>; hasNext: boolean }> {
        try {
            let conditions: object = {
                $or: [{ name: { $regex: keyword, $options: 'i' } }, { domain: { $regex: keyword, $options: 'i' } }],
            };
            let hostQuery: DocumentQuery<Array<HostModelInterface>, HostModelInterface, object> = HostModel.find(
                conditions
            );
            let remainHostQuery: Query<number> = HostModel.countDocuments(conditions);

            if (offset) {
                hostQuery.skip(offset);
                remainHostQuery.skip(offset);
            }
            if (limit) {
                hostQuery.limit(limit);
            }

            let hosts: Array<HostModelInterface> = await hostQuery.exec();
            let remainHost: number = await remainHostQuery.exec();

            return { hosts: hosts, hasNext: hosts.length < remainHost };
        } catch (error) {
            throw new Exception.Customize(
                error.statusCode || Common.ResponseStatusCode.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Database.FailedResponse.RootCause.DB_RC_2
            );
        }
    }

    /**
     * @param id
     *
     * @return Promise<object>
     */
    public async getById(id: string | number): Promise<HostModelInterface | null> {
        try {
            await HostLogic.checkHostExistedWithId(id);

            return await HostModel.findById(id).exec();
        } catch (error) {
            throw new Exception.Customize(
                error.statusCode || Common.ResponseStatusCode.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Database.FailedResponse.RootCause.DB_RC_2
            );
        }
    }

    /**
     * @param body
     *
     * @return Promise<object>
     */
    public async create({ name, domain }: HostModelInterface): Promise<HostModelInterface> {
        try {
            await HostLogic.checkHostExistedWithDomain(domain, true);

            return await new HostModel({
                name: name,
                domain: domain,
            }).save();
        } catch (error) {
            throw new Exception.Customize(
                error.statusCode || Common.ResponseStatusCode.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Database.FailedResponse.RootCause.DB_RC_2
            );
        }
    }

    /**
     * @param id
     * @param body
     *
     * @return Promise<object>
     */
    public async update(
        id: string | number,
        { name, domain }: HostModelInterface
    ): Promise<HostModelInterface | undefined> {
        try {
            await HostLogic.checkHostExistedWithId(id);

            let host: HostModelInterface | null = await HostModel.findById(id).exec();

            if (!host) {
                return;
            }

            if (host.domain !== domain) {
                await HostLogic.checkHostExistedWithDomain(domain);
            }

            host.name = name || host.name;
            host.domain = domain || host.domain;

            return await host.save();
        } catch (error) {
            throw new Exception.Customize(
                error.statusCode || Common.ResponseStatusCode.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Database.FailedResponse.RootCause.DB_RC_2
            );
        }
    }

    /**
     * @param id
     *
     * @return Promise<null>
     */
    public async delete(id: string | number): Promise<null> {
        try {
            await HostLogic.checkHostExistedWithId(id);
            await HostModel.findByIdAndDelete(id).exec();

            return null;
        } catch (error) {
            throw new Exception.Customize(
                error.statusCode || Common.ResponseStatusCode.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Database.FailedResponse.RootCause.DB_RC_2
            );
        }
    }

    /**
     * @param domain
     */
    public static checkHostExistedWithDomain = async (domain: string, isNot: boolean = false): Promise<void> => {
        let result: number = await HostModel.countDocuments({ domain: domain }).exec();

        if (!isNot && result === 0) {
            throw new Exception.Customize(
                Common.ResponseStatusCode.BAD_REQUEST,
                HostErrorResponseMessage.HO_MSG_1,
                HostErrorResponseRootCause.HO_RC_1,
                ['domain', domain]
            );
        }

        if (!isNot && result > 0) {
            throw new Exception.Customize(
                Common.ResponseStatusCode.BAD_REQUEST,
                HostErrorResponseMessage.HO_MSG_2,
                HostErrorResponseRootCause.HO_RC_2,
                ['domain', domain]
            );
        }
    };

    /**
     * @param id
     * @param isNot
     */
    public static checkHostExistedWithId = async (
        id: string | number | HostModelInterface,
        isNot: boolean = false
    ): Promise<void> => {
        if (typeof id === 'object') {
            id = id._id;
        }
        let result: number = await HostModel.countDocuments({ _id: id }).exec();

        if (!isNot && result === 0) {
            throw new Exception.Customize(
                Common.ResponseStatusCode.BAD_REQUEST,
                HostErrorResponseMessage.HO_MSG_1,
                HostErrorResponseRootCause.HO_RC_1,
                ['id', id]
            );
        }

        if (isNot && result > 0) {
            throw new Exception.Customize(
                Common.ResponseStatusCode.BAD_REQUEST,
                HostErrorResponseMessage.HO_MSG_2,
                HostErrorResponseRootCause.HO_RC_2,
                ['id', id]
            );
        }
    };

    /**
     * @param host
     */
    public static convertToResponse({ _id, name, domain, cTime, mTime }: HostModelInterface): HostApiInterface {
        let data: HostApiInterface = {
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
