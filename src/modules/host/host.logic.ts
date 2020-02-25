import HostModel from './host.model';
import { Constant } from '../../util/definition/constant';
import { HostErrorMessage } from './host.error-message';
import CustomizeException from '../exception/customize.exception';
import { Cause } from '../../util/definition/error/cause';
import HostModelInterface from './host.model.interface';
import { DocumentQuery, Query } from 'mongoose';

class HostLogic {
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
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { domain: { $regex: keyword, $options: 'i' } },
                ],
            };
            let hostQuery: DocumentQuery<
                Array<HostModelInterface>,
                HostModelInterface,
                object
            > = HostModel.find(conditions);
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
            throw new CustomizeException(
                error.statusCode || Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Cause.DATABASE
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
            throw new CustomizeException(
                error.statusCode || Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Cause.DATABASE
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
            await HostLogic.checkHostExistedWithDomain(domain);

            return await new HostModel({
                name: name,
                domain: domain,
            }).save();
        } catch (error) {
            throw new CustomizeException(
                error.statusCode || Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Cause.DATABASE
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
            throw new CustomizeException(
                error.statusCode || Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Cause.DATABASE
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
            throw new CustomizeException(
                error.statusCode || Constant.RESPONSE_STATUS_CODE.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Cause.DATABASE
            );
        }
    }

    /**
     * @param domain
     */
    public static checkHostExistedWithDomain = async (domain: string): Promise<void> => {
        if ((await HostModel.countDocuments({ domain: domain }).exec()) > 0) {
            new CustomizeException(
                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                HostErrorMessage.HOST_ERR_2,
                Cause.DATA_VALUE.EXISTS,
                ['domain', domain]
            ).raise();
        }
    };

    /**
     * @param id
     */
    public static checkHostExistedWithId = async (
        id: string | number | HostModelInterface
    ): Promise<void> => {
        if (typeof id === 'object') {
            id = id._id;
        }

        if ((await HostModel.countDocuments({ _id: id }).exec()) === 0) {
            new CustomizeException(
                Constant.RESPONSE_STATUS_CODE.BAD_REQUEST,
                HostErrorMessage.HOST_ERR_1,
                Cause.DATA_VALUE.NOT_FOUND,
                ['id', id]
            ).raise();
        }
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
