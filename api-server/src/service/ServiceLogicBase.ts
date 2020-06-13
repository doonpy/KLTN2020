import {
    CommonApiModel,
    CommonDocumentModel,
    CommonLogicBaseInterface,
    CommonOptions,
    GetAllReturnData,
} from '@service/interface';
import { CreateQuery, FilterQuery, Model, UpdateQuery } from 'mongoose';
import ResponseStatusCode from '@common/response-status-code';
import Wording from '@service/wording';

enum ValidateType {
    EXISTED,
    NOT_EXISTED,
}

export default abstract class ServiceLogicBase<
    T extends CommonDocumentModel,
    A extends CommonApiModel
> implements CommonLogicBaseInterface<T, A> {
    protected constructor(protected model: Model<T>) {}

    /**
     * @param properties
     * @param {ValidateType} type
     */
    private async validate(
        properties: Array<FilterQuery<T>>,
        type: ValidateType
    ): Promise<void> {
        const promise: Array<Promise<void>> = [];
        properties.forEach((prop) => {
            if (type === ValidateType.EXISTED) {
                promise.push(this.checkExisted(prop));
            } else {
                promise.push(this.checkNotExisted(prop));
            }
        });

        await Promise.all(promise);
    }

    /**
     * @param {CommonOptions} input
     *
     * @return {Promise<GetAllReturnData<T>>}
     */
    public async getAll({
        limit,
        offset,
        conditions,
    }: CommonOptions): Promise<GetAllReturnData<T>> {
        const documentQuery = this.model.find(conditions ?? {});
        const remainQuery = this.model.countDocuments(conditions ?? {});

        if (offset) {
            documentQuery.skip(offset);
            remainQuery.skip(offset);
        }

        if (limit) {
            documentQuery.limit(limit);
        }

        const promises: [Promise<T[]>, Promise<number> | number] = [
            documentQuery.exec(),
            limit ? remainQuery.exec() : -1,
        ];
        const [documents, remainAmount] = await Promise.all(promises);

        return { documents, hasNext: documents.length < remainAmount };
    }

    /**
     * @param {number} id
     *
     * @return {Promise<T | never>}
     */
    public async getById(id: number): Promise<T | never> {
        await this.checkExisted({ _id: id } as FilterQuery<T>);

        return (await this.model.findById(id)) as T;
    }

    /**
     * @param {object} conditions
     *
     * @return {Promise<T | null>}
     */
    public async getOne(conditions: FilterQuery<T>): Promise<T | null> {
        return this.model.findOne(conditions);
    }

    /**
     * @param {T} input
     * @param validateExistedProperties
     * @param validateNotExistedProperties
     *
     * @return {Promise<T>}
     */
    public async create(
        input: T,
        validateExistedProperties?: Array<FilterQuery<T>>,
        validateNotExistedProperties?: Array<FilterQuery<T>>
    ): Promise<T> {
        if (validateExistedProperties) {
            await this.validate(
                validateExistedProperties,
                ValidateType.EXISTED
            );
        }

        if (validateNotExistedProperties) {
            await this.validate(
                validateNotExistedProperties,
                ValidateType.NOT_EXISTED
            );
        }

        return this.model.create(input as CreateQuery<T>);
    }

    /**
     * @param {number} id
     * @param {T} input
     * @param validateExistedProperties
     * @param validateNotExistedProperties
     *
     * @return {Promise<T | never>}
     */
    public async update(
        id: number,
        input: UpdateQuery<T>,
        validateExistedProperties?: Array<FilterQuery<T>>,
        validateNotExistedProperties?: Array<FilterQuery<T>>
    ): Promise<T | never> {
        await this.checkExisted({ _id: id } as FilterQuery<T>);

        if (validateExistedProperties) {
            await this.validate(
                validateExistedProperties,
                ValidateType.EXISTED
            );
        }

        if (validateNotExistedProperties) {
            await this.validate(
                validateNotExistedProperties,
                ValidateType.NOT_EXISTED
            );
        }

        const document = await this.model.findById(id);
        Object.keys(input).forEach((key) => {
            document!.set(key, input[key]);
        });

        return document!.save();
    }

    /**
     * @param {number} id
     *
     * @return {Promise<void>}
     */
    public async delete(id: number): Promise<void> {
        await this.checkExisted({ _id: id } as FilterQuery<T>);
        await this.model.findByIdAndDelete(id);
    }

    /**
     * @param {object} conditions
     *
     * @return {boolean}
     */
    public async isExists(conditions: FilterQuery<T>): Promise<boolean> {
        return (await this.model.findOne(conditions)) !== null;
    }

    /**
     * @param {object} conditions
     *
     * @return {Promise<void>}
     */
    public async checkExisted(conditions: FilterQuery<T>): Promise<void> {
        if (!(await this.isExists(conditions))) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: {
                    wording: Wording.CAUSE.CAU_CM_SER_1,
                    value: [],
                },
                message: {
                    wording: Wording.MESSAGE.MSG_CM_SER_1,
                    value: [Wording.RESOURCE.RSC_CM_SER_1, conditions],
                },
            };
        }
    }

    /**
     * @param {object} conditions
     *
     * @return {Promise<void>}
     */
    public async checkNotExisted(conditions: FilterQuery<T>): Promise<void> {
        if (await this.isExists(conditions)) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: {
                    wording: Wording.CAUSE.CAU_CM_SER_2,
                    value: [],
                },
                message: {
                    wording: Wording.MESSAGE.MSG_CM_SER_2,
                    value: [Wording.RESOURCE.RSC_CM_SER_1, conditions],
                },
            };
        }
    }

    /**
     * Get current amount document
     */
    public async getDocumentAmount(
        conditions?: FilterQuery<T>
    ): Promise<number> {
        return this.model.countDocuments(conditions ?? {});
    }

    /**
     * @param {CommonDocumentModel} input
     *
     * @return {CommonApiModel}
     */
    public abstract convertToApiResponse(input: T): A;

    /**
     * @param {object[]} aggregations
     *
     * @return {Promise<any[]>}
     */
    public async getWithAggregation<AT>(aggregations: object[]): Promise<AT[]> {
        return this.model.aggregate<AT>(aggregations).allowDiskUse(true).exec();
    }
}
