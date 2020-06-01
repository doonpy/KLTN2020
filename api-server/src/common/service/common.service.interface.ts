import { Document } from 'mongoose';
import { Router } from 'express';

export interface CommonDocumentModel extends Document {
    cTime: string;
    mTime: string;
}

export interface CommonApiModel {
    id: number | null;
    createAt: string | null;
    updateAt: string | null;
}

export interface GetAllReturnData<T extends CommonDocumentModel> {
    documents: T[];
    hasNext: boolean;
}

export interface CommonOptions {
    limit?: number;
    offset?: number;
    conditions?: object;
}

export interface CommonLogicBaseInterface<T extends CommonDocumentModel, A extends CommonApiModel> {
    /**
     * @param {CommonOptions} options
     *
     * @return {Promise<GetAllReturnData<T>>}
     */
    getAll(options: CommonOptions): Promise<GetAllReturnData<T>>;

    /**
     * @param {number} id
     *
     * @return {Promise<T | null>}
     */
    getById(id: number): Promise<T | null>;

    /**
     * @param {object} conditions
     *
     * @return {Promise<T | null>}
     */
    getOne(conditions: object): Promise<T | null>;

    /**
     * @param {T} input
     *
     * @return {Promise<T>}
     */
    create(input: T): Promise<T>;

    /**
     * @param {number} id
     * @param {T} input
     *
     * @return {Promise<T>}
     */
    update(id: number, input: T): Promise<T>;

    /**
     * @param {number} id
     *
     * @return {Promise<void>}
     */
    delete(id: number): Promise<void>;

    /**
     * @param {object} conditions
     *
     * @return {Promise<boolean>}
     */
    isExisted(conditions: object): Promise<boolean>;

    /**
     * @param {object} conditions
     *
     * @return {Promise<void>}
     */
    checkExisted(conditions: object): Promise<void>;

    /**
     * @param {object} conditions
     *
     * @return {Promise<void>}
     */
    checkNotExisted(conditions: object): Promise<void>;

    /**
     * @param {T} input
     *
     * @return {A}
     */
    convertToApiResponse(input: T): A;

    /**
     * Get current amount document
     */
    getDocumentAmount(conditions?: object): Promise<number>;
}

export interface CommonServiceControllerBaseInterface {
    router: Router;
}
