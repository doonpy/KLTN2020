import {
    CommonApiModel,
    CommonDocumentModel,
    CommonLogicBaseInterface,
    CommonOptions,
    GetAllReturnData,
} from '@common/service/common.service.interface';
import { Model } from 'mongoose';
import ResponseStatusCode from '@common/common.response-status.code';
import CommonServiceWording from '@common/service/common.service.wording';

export default abstract class CommonServiceLogicBase<T extends CommonDocumentModel, A extends CommonApiModel>
    implements CommonLogicBaseInterface<T, A> {
    protected constructor(protected model: Model<T>) {}

    /**
     * @param {CommonOptions} input
     *
     * @return {Promise<GetAllReturnData<T>>}
     */
    public async getAll({ limit, offset, conditions }: CommonOptions): Promise<GetAllReturnData<T>> {
        const documentQuery = this.model.find(conditions ?? {});
        const remainQuery = this.model.countDocuments(conditions ?? {});

        if (offset) {
            documentQuery.skip(offset);
            remainQuery.skip(offset);
        }

        if (limit) {
            documentQuery.limit(limit);
        }

        const documents = await documentQuery.exec();
        const remainAmount = await remainQuery.exec();

        return { documents, hasNext: documents.length < remainAmount };
    }

    /**
     * @param {number} id
     *
     * @return {Promise<T | never>}
     */
    public async getById(id: number): Promise<T | never> {
        await this.checkExisted({ _id: id });

        return (await this.model.findById(id)) as T;
    }

    /**
     * @param {object} conditions
     *
     * @return {Promise<T | null>}
     */
    public async getOne(conditions: object): Promise<T | null> {
        return this.model.findOne(conditions);
    }

    /**
     * @param {T} input
     *
     * @return {Promise<T>}
     */
    public async create(input: T): Promise<T> {
        return this.model.create(input);
    }

    /**
     * @param {number} id
     * @param {T} input
     *
     * @return {Promise<T | never>}
     */
    public async update(id: number, input: T): Promise<T | never> {
        await this.checkExisted({ _id: id });

        return (await this.model.findByIdAndUpdate(id, input, { new: true, omitUndefined: true })) as T;
    }

    /**
     * @param {number} id
     *
     * @return {Promise<void>}
     */
    public async delete(id: number): Promise<void> {
        await this.checkExisted({ _id: id });
        await this.model.findByIdAndDelete(id);
    }

    /**
     * @param {object} conditions
     *
     * @return {boolean}
     */
    public async isExisted(conditions: object): Promise<boolean> {
        return (await this.model.findOne(conditions)) !== null;
    }

    /**
     * @param {object} conditions
     *
     * @return {Promise<void>}
     */
    public async checkExisted(conditions: object): Promise<void> {
        if (!(await this.isExisted(conditions))) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: {
                    wording: CommonServiceWording.CAUSE.CAU_CM_SER_1,
                    value: [],
                },
                message: {
                    wording: CommonServiceWording.MESSAGE.MSG_CM_SER_1,
                    value: [CommonServiceWording.RESOURCE.RSC_CM_SER_1, conditions],
                },
            };
        }
    }

    /**
     * @param {object} conditions
     *
     * @return {Promise<void>}
     */
    public async checkNotExisted(conditions: object): Promise<void> {
        if (await this.isExisted(conditions)) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: {
                    wording: CommonServiceWording.CAUSE.CAU_CM_SER_2,
                    value: [],
                },
                message: {
                    wording: CommonServiceWording.MESSAGE.MSG_CM_SER_2,
                    value: [CommonServiceWording.RESOURCE.RSC_CM_SER_1, conditions],
                },
            };
        }
    }

    /**
     * Get current amount document
     */
    public async getDocumentAmount(conditions?: object): Promise<number> {
        return this.model.countDocuments(conditions ?? {});
    }

    /**
     * @param {CommonDocumentModel} input
     *
     * @return {CommonApiModel}
     */
    public abstract convertToApiResponse(input: T): A;
}
