import { CommonApiModel, CommonDocumentModel, CommonLogicBaseInterface } from './common.service.interface';

export default abstract class CommonServiceLogicBase implements CommonLogicBaseInterface {
    /**
     * @param {number | undefined} limit
     * @param {number | undefined} offset
     * @param {object | undefined} conditions
     * @param {boolean | undefined} isPopulate
     *
     * @return {Promise<{ documents: CommonDocumentModel[]; hasNext: boolean }>}
     */
    public abstract async getAll(
        limit?: number,
        offset?: number,
        conditions?: object,
        isPopulate?: boolean
    ): Promise<{ documents: CommonDocumentModel[]; hasNext: boolean }>;

    /**
     * @param {number} id
     * @param {boolean | undefined} isPopulate
     *
     * @return {Promise<CommonDocumentModel | null>}
     */
    public abstract async getById(id: number, isPopulate?: boolean): Promise<CommonDocumentModel>;

    /**
     * @param {CommonDocumentModel} input
     * @param {boolean | undefined} isPopulate
     *
     * @return {Promise<CommonDocumentModel>}
     */
    public abstract async create(input: CommonDocumentModel, isPopulate?: boolean): Promise<CommonDocumentModel>;

    /**
     * @param {number} id
     * @param {CommonDocumentModel} input
     * @param {boolean | undefined} isPopulate
     *
     * @return {Promise<CommonDocumentModel>}
     */
    public abstract async update(
        id: number,
        input: CommonDocumentModel,
        isPopulate?: boolean
    ): Promise<CommonDocumentModel>;

    /**
     * @param {number} id
     *
     * @return {Promise<void>}
     */
    public abstract async delete(id: number): Promise<void>;

    /**
     * @param {number} id
     *
     * @return {boolean}
     */
    public abstract async isExistsWithId(id: number | CommonDocumentModel): Promise<boolean>;

    /**
     * @param {number} id
     * @param {boolean | undefined} isNot
     *
     * @return {Promise<void>}
     */
    public abstract async checkExistsWithId(id: number | CommonDocumentModel, isNot?: boolean): Promise<void>;

    /**
     * @param {CommonDocumentModel} input
     *
     * @return {CommonApiModel}
     */
    public abstract convertToApiResponse(input: CommonDocumentModel): CommonApiModel;
}
